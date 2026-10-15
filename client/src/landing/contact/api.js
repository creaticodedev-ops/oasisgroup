const ENDPOINT = '/api/contact'

let availability = null

/**
 * Whether the form can deliver requests (the endpoint answers and e-mail delivery is configured).
 * Resolves to true / false, or null when the check itself failed (e.g. offline). Checked once per page load.
 */
export const contactAvailability = () => {
  availability ||= fetch(ENDPOINT, { headers: { accept: 'application/json' } })
    .then((response) => (response.ok ? response.json() : null))
    .then((body) => body?.enabled === true)
    .catch(() => {
      availability = null
      return null
    })
  return availability
}

export const submitInquiry = async (payload) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(body.error || `HTTP ${response.status}`), { status: response.status, body })
  return body
}
