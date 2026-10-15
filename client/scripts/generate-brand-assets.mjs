/**
 * Derives every brand asset from the official logo file (brand/oasis-group-logo.png):
 *
 * - src/assets/brand/oasis-group-logo.png    the logo, trimmed to its artwork (pixels copied as-is)
 * - src/assets/brand/oasis-group-emblem.png  the "O" emblem alone (ring + triangle), pixels copied as-is
 * - public/favicon.ico, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png
 * - public/og-image.png                      social sharing image (1200 × 630)
 *
 * To use a new version of the logo (ideally a larger PNG, white on transparent), replace
 * brand/oasis-group-logo.png and run: npm run brand:assets
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(root, 'brand', 'oasis-group-logo.png')
const assetsOut = path.join(root, 'src', 'assets', 'brand')
const publicOut = path.join(root, 'public')
const BLACK = { r: 10, g: 10, b: 10, alpha: 1 }
const SOLID = 24

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const alphaAt = (x, y) => data[(y * W + x) * 4 + 3]

const bounds = (test) => {
  let left = W
  let top = H
  let right = -1
  let bottom = -1
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!test(x, y)) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

/** Connected shapes of the artwork (8-connectivity on clearly opaque pixels). */
const labels = new Int32Array(W * H).fill(-1)
const shapes = []
for (let start = 0; start < W * H; start += 1) {
  if (labels[start] !== -1 || data[start * 4 + 3] < SOLID) continue
  const id = shapes.length
  const shape = { left: W, top: H, right: 0, bottom: 0 }
  const stack = [start]
  labels[start] = id
  while (stack.length) {
    const index = stack.pop()
    const x = index % W
    const y = (index - x) / W
    shape.left = Math.min(shape.left, x)
    shape.right = Math.max(shape.right, x)
    shape.top = Math.min(shape.top, y)
    shape.bottom = Math.max(shape.bottom, y)
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const next = ny * W + nx
        if (labels[next] === -1 && alphaAt(nx, ny) >= SOLID) {
          labels[next] = id
          stack.push(next)
        }
      }
    }
  }
  shapes.push(shape)
}

// The emblem is the leftmost shape (the ring of the "O") plus every shape that starts inside it (the triangle,
// whose base sits on the opening of the ring).
const ring = shapes.reduce((best, shape) => (shape.left < best.left ? shape : best))
const inside = (shape) =>
  shape === ring || (shape.left >= ring.left && shape.right <= ring.right && shape.top > ring.top && shape.top < ring.bottom)
const emblemIds = new Set(shapes.flatMap((shape, id) => (inside(shape) ? [id] : [])))

/** Pixels of the emblem: its shapes and their anti-aliased edge, never the neighbouring letter. */
const inEmblem = (x, y) => {
  if (alphaAt(x, y) === 0) return false
  const own = labels[y * W + x]
  if (own !== -1) return emblemIds.has(own)
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const label = labels[ny * W + nx]
      if (label !== -1 && !emblemIds.has(label)) return false
    }
  }
  return x >= ring.left - 1 && x <= ring.right + 1 && y >= ring.top - 1 && y <= ring.bottom + 1
}

const logoBox = bounds((x, y) => alphaAt(x, y) > 0)
const emblemBox = bounds(inEmblem)

const emblemPixels = Buffer.alloc(emblemBox.width * emblemBox.height * 4)
for (let y = 0; y < emblemBox.height; y += 1) {
  for (let x = 0; x < emblemBox.width; x += 1) {
    const sx = emblemBox.left + x
    const sy = emblemBox.top + y
    if (!inEmblem(sx, sy)) continue
    data.copy(emblemPixels, (y * emblemBox.width + x) * 4, (sy * W + sx) * 4, (sy * W + sx) * 4 + 4)
  }
}

const png = (image) => image.png({ compressionLevel: 9, palette: false })
const raw = { raw: { width: W, height: H, channels: 4 } }
const logo = await png(sharp(data, raw).extract(logoBox)).toBuffer()
const emblem = await png(sharp(emblemPixels, { raw: { width: emblemBox.width, height: emblemBox.height, channels: 4 } })).toBuffer()

fs.mkdirSync(assetsOut, { recursive: true })
fs.writeFileSync(path.join(assetsOut, 'oasis-group-logo.png'), logo)
fs.writeFileSync(path.join(assetsOut, 'oasis-group-emblem.png'), emblem)

/** White emblem centred on a black square; `fill` is the share of the square taken by the emblem. */
const icon = async (size, fill) => {
  const box = Math.round(size * fill)
  const mark = await sharp(emblem).resize(box, box, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' }).toBuffer()
  return png(sharp({ create: { width: size, height: size, channels: 4, background: BLACK } }).composite([{ input: mark, gravity: 'centre' }])).toBuffer()
}

/** ICO container with PNG-encoded images (supported by every current browser). */
const ico = (images) => {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, buffer }, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(buffer.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += buffer.length
  })
  return Buffer.concat([header, ...images.map((image) => image.buffer)])
}

const favicons = await Promise.all([16, 32, 48].map(async (size) => ({ size, buffer: await icon(size, 0.86) })))
fs.writeFileSync(path.join(publicOut, 'favicon.ico'), ico(favicons))
fs.writeFileSync(path.join(publicOut, 'favicon-32x32.png'), favicons[1].buffer)
fs.writeFileSync(path.join(publicOut, 'apple-touch-icon.png'), await icon(180, 0.58))
fs.writeFileSync(path.join(publicOut, 'icon-192.png'), await icon(192, 0.58))
fs.writeFileSync(path.join(publicOut, 'icon-512.png'), await icon(512, 0.58))

const ogLogoWidth = Math.min(logoBox.width * 4, 420)
const ogLogo = await sharp(logo).resize({ width: ogLogoWidth, kernel: 'lanczos3' }).toBuffer()
const ogLogoHeight = Math.round((logoBox.height * ogLogoWidth) / logoBox.width)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <g stroke="#ffffff" stroke-opacity="0.07">${Array.from({ length: 11 }, (_, i) => `<line x1="${100 * (i + 1)}" y1="0" x2="${100 * (i + 1)}" y2="630"/>`).join('')}</g>
  <text x="100" y="${150 + ogLogoHeight + 120}" fill="#e5e5e5" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-style="italic">L’excellence au service de vos ambitions.</text>
  <text x="100" y="${150 + ogLogoHeight + 190}" fill="#8a8a8a" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="6">CORPORATE · PERFORMANCE · FACILITIES · IT</text>
</svg>`
await png(sharp(Buffer.from(og)).composite([{ input: ogLogo, left: 100, top: 150 }])).toFile(path.join(publicOut, 'og-image.png'))

fs.rmSync(path.join(publicOut, 'favicon.svg'), { force: true })

console.log(`Logo ${logoBox.width}×${logoBox.height}, emblem ${emblemBox.width}×${emblemBox.height} — brand assets written.`)
