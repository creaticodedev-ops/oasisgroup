/** Reads a `{ fr, en, ar }` value from editable config, falling back to French; plain strings pass through. */
export const localized = (value, locale) => (value && typeof value === 'object' ? value[locale] || value.fr || '' : value || '')
