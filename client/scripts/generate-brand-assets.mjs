/**
 * Builds the OASIS GROUP favicons and social image from the vector monogram
 * (a disc cut by two horizon lines — same geometry as `BrandMark` in src/landing/ui.jsx).
 *
 * Usage: npm run brand:assets
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicOut = path.join(root, 'public')
const BLACK = '#0a0a0a'
const WHITE = '#ffffff'

const mark = (color) =>
  `<mask id="cut"><rect width="40" height="40" fill="#fff"/><rect y="22.6" width="40" height="2" fill="#000"/><rect y="28.4" width="40" height="3" fill="#000"/></mask>` +
  `<circle cx="20" cy="20" r="18" fill="${color}" mask="url(#cut)"/>`

const markSvg = (size, padding) => {
  const inner = 40 / (1 - padding * 2)
  const offset = (inner - 40) / 2
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-offset} ${-offset} ${inner} ${inner}">` +
      `<rect x="${-offset}" y="${-offset}" width="${inner}" height="${inner}" fill="${BLACK}"/>${mark(WHITE)}</svg>`,
  )
}

const icon = (size, file, padding = 0.18) => sharp(markSvg(size, padding)).png({ compressionLevel: 9 }).toFile(path.join(publicOut, file))

fs.mkdirSync(publicOut, { recursive: true })
await icon(32, 'favicon-32x32.png', 0.06)
await icon(180, 'apple-touch-icon.png')
await icon(192, 'icon-192.png')
await icon(512, 'icon-512.png')

fs.writeFileSync(
  path.join(publicOut, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 44 44"><style>g{color:${BLACK}}@media (prefers-color-scheme:dark){g{color:${WHITE}}}</style><g>${mark('currentColor')}</g></svg>\n`,
)

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BLACK}"/>
  <g stroke="#ffffff" stroke-opacity="0.07">${Array.from({ length: 11 }, (_, i) => `<line x1="${100 * (i + 1)}" y1="0" x2="${100 * (i + 1)}" y2="630"/>`).join('')}</g>
  <g transform="translate(96 96) scale(2.2)">${mark(WHITE)}</g>
  <text x="96" y="420" fill="${WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="128" font-weight="700" letter-spacing="-4">OASIS GROUP</text>
  <text x="100" y="500" fill="#a3a3a3" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-style="italic">L’excellence au service de vos ambitions.</text>
  <text x="100" y="560" fill="#6b6b6b" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="6">CORPORATE · PERFORMANCE · FACILITIES · IT</text>
</svg>`
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(path.join(publicOut, 'og-image.png'))

console.log('Brand assets generated in public/')
