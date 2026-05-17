export const DEFAULT_ADMIN_SECTION = 'revenue'

export const ADMIN_SECTIONS = [
  'revenue',
  'accounts',
  'menu',
  'news',
  'activities',
  'vouchers',
  'orders',
  'tables',
]

export const getAdminSectionFromPathname = (pathname = '') => {
  const segments = pathname.split('/').filter(Boolean)
  const section = segments[1]
  return ADMIN_SECTIONS.includes(section) ? section : DEFAULT_ADMIN_SECTION
}

export const getAdminSectionHref = (section) =>
  `/admin/${ADMIN_SECTIONS.includes(section) ? section : DEFAULT_ADMIN_SECTION}`
