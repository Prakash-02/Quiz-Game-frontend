const API = import.meta.env.VITE_API_URL || ''

async function request(method, path, body, isMultipart = false) {
  const opts = { method, headers: {} }
  if (body && !isMultipart) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (isMultipart) {
    opts.body = body
  }
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),
  postForm: (path, formData) => request('POST', path, formData, true),
}
