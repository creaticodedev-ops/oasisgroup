/**
 * Published projects ("Nos réalisations"). Add an entry only for a real project whose client agreed to its publication —
 * until then the section shows an editorial "references on request" state.
 *
 * {
 *   id: 'unique-id',
 *   department: 'corporate' | 'performance' | 'facilities' | 'it',
 *   year: 2026,
 *   location: 'Casablanca',
 *   image: '/projects/unique-id.webp',            // optional, placed in client/public/projects/
 *   title: { fr: '…', en: '…', ar: '…' },
 *   summary: { fr: '…', en: '…', ar: '…' },
 *   client: { fr: '…', en: '…', ar: '…' },        // optional, only with the client's consent
 * }
 */
export const PROJECTS = []
