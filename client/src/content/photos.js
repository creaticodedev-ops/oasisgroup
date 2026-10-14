/**
 * Photography catalogue (Unsplash License — free for commercial use, credit appreciated).
 * Files are generated into `public/photos/` by `npm run photos --prefix client`:
 * every entry becomes `<name>-<width>.webp` for each width, plus a blur placeholder in `photoMeta.js`.
 * `position` is the focal point used by `object-position` when the frame crops the picture.
 */
export const PHOTO_WIDTHS = [480, 800, 1200, 1800]
export const HERO_WIDTHS = [640, 1000, 1400, 2000, 2600]

export const PHOTOS = {
  hero: { source: 'photo-1449157291145-7efd050a4d0e', position: '50% 45%', widths: HERO_WIDTHS, credit: 'Unsplash' },
  about: { source: 'photo-1487958449943-2429e8be8625', position: '60% 50%' },
  why: { source: 'photo-1511818966892-d7d671e672a2', position: '50% 40%' },
  commitments: { source: 'photo-1486406146926-c627a92ad1ab', position: '50% 50%' },
  careers: { source: 'photo-1521737604893-d14cc237f11d', position: '50% 50%' },

  corporate: { source: 'photo-1497366811353-6870744d04b2', position: '45% 50%', widths: HERO_WIDTHS },
  corporateDesk: { source: 'photo-1520607162513-77705c0f0d4a', position: '50% 50%' },
  corporateWindow: { source: 'photo-1497215728101-856f4ea42174', position: '40% 50%' },

  performance: { source: 'photo-1534438327276-14e5300c3a48', position: '50% 50%', widths: HERO_WIDTHS },
  performanceStadium: { source: 'photo-1522778119026-d647f0596c20', position: '50% 60%' },
  performanceEvent: { source: 'photo-1531058020387-3be344556be6', position: '50% 50%' },

  facilities: { source: 'photo-1621905251189-08b45d6a269e', position: '45% 35%', widths: HERO_WIDTHS },
  facilitiesCare: { source: 'photo-1581578731548-c64695cc6952', position: '35% 40%' },
  facilitiesPlans: { source: 'photo-1503387762-592deb58ef4e', position: '50% 50%' },

  it: { source: 'photo-1558494949-ef010cbdcc31', position: '50% 50%', widths: HERO_WIDTHS },
  itTeam: { source: 'photo-1573164713988-8665fc963095', position: '60% 40%' },
  itCode: { source: 'photo-1461749280684-dccba630e2f6', position: '50% 50%' },
}
