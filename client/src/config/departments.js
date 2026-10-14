/**
 * The four departments of the group. Copy lives in the i18n dictionaries under `departments.<id>`;
 * photographs are names from `src/content/photos.js`.
 */
export const DEPARTMENTS = [
  { id: 'corporate', slug: 'corporate', number: '01', photo: 'corporate', gallery: ['corporateDesk', 'corporateWindow'] },
  { id: 'performance', slug: 'performance', number: '02', photo: 'performance', gallery: ['performanceStadium', 'performanceEvent'] },
  { id: 'facilities', slug: 'facilities', number: '03', photo: 'facilities', gallery: ['facilitiesCare', 'facilitiesPlans'] },
  { id: 'it', slug: 'it', number: '04', photo: 'it', gallery: ['itTeam', 'itCode'] },
]

export const DEPARTMENT_IDS = DEPARTMENTS.map((item) => item.id)

export const departmentPath = (department) => `/expertises/${department.slug}`

export const findDepartment = (slug) => DEPARTMENTS.find((item) => item.slug === slug) || null
