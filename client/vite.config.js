import { Buffer } from 'node:buffer'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { GET, POST } from './api/contact.js'
import { DEPARTMENTS, departmentPath } from './src/config/departments.js'

const root = fileURLToPath(new URL('.', import.meta.url))
const FUNCTION_ENV = ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']

/** Runs the Vercel Function api/contact.js inside `vite` and `vite preview`, so the form behaves locally as in production. */
const contactApi = () => {
  const handlers = { GET, POST }
  const middleware = async (req, res, next) => {
    if (req.url.split('?')[0] !== '/api/contact') return next()
    const handler = handlers[req.method]
    if (!handler) {
      res.writeHead(405, { allow: 'GET, POST' }).end()
      return
    }
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const headers = new Headers(Object.entries(req.headers).filter(([key, value]) => typeof value === 'string' && !key.startsWith(':')))
      headers.set('x-forwarded-for', req.socket.remoteAddress || 'local')
      const request = new Request(new URL(req.url, `http://${req.headers.host}`), {
        method: req.method,
        headers,
        body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
      })
      const response = await handler(request)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      next(error)
    }
  }
  return {
    name: 'oasis-contact-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

/** Absolute social image URL, robots.txt and sitemap.xml — built from the public address of the site when it is known. */
const seo = (siteUrl) => ({
  name: 'oasis-seo',
  transformIndexHtml: (html) => (siteUrl ? html.replace('content="/og-image.png"', `content="${siteUrl}/og-image.png"`) : html),
  generateBundle() {
    const robots = ['User-agent: *', 'Allow: /']
    if (siteUrl) {
      const urls = ['/', ...DEPARTMENTS.map(departmentPath)].map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      })
      robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
    }
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '')
  // Local runs read the function settings from client/.env.local; on Vercel they come from the project settings.
  for (const key of FUNCTION_ENV) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const siteUrl = (env.VITE_SITE_URL || (productionHost ? `https://${productionHost}` : '')).replace(/\/+$/, '')

  return {
    plugins: [react(), contactApi(), seo(siteUrl)],
    server: { host: true, port: 3000, strictPort: true },
    preview: { host: true, port: 3000 },
    build: { target: 'es2020', sourcemap: false, reportCompressedSize: false },
  }
})
