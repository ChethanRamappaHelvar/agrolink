// ---------------------------------------------------------------------------
// api.js - ONE place that talks to the Spring Boot backend using fetch().
// Every other service file (authService, farmerService ...) uses request().
// The login token is kept in localStorage so the user stays logged in after refresh.
// ---------------------------------------------------------------------------
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const TOKEN_KEY = 'agri_token'
const USER_KEY = 'agri_user'

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }   // JSON.parse
  },
  save: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))                              // JSON.stringify
  },
  saveUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) },
}

/** Turns a relative image path (/uploads/a.jpg) into a full URL. */
export const imageSrc = (url) => (!url ? null : url.startsWith('http') ? url : API_URL + url)

export async function request(path, { method = 'GET', body, params, form } = {}) {
  let url = API_URL + path
  if (params) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v) })
    const s = q.toString()
    if (s) url += '?' + s
  }
  const headers = {}
  const token = storage.getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  let payload
  if (form) payload = form                                  // file upload (FormData)
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }

  let res
  try {
    res = await fetch(url, { method, headers, body: payload })
  } catch {
    throw new Error('Cannot reach the server. Is the Spring Boot backend running on ' + API_URL + ' ?')
  }
  let data = null
  const text = await res.text()
  if (text) { try { data = JSON.parse(text) } catch { data = text } }

  if (!res.ok) {
    if (res.status === 401 && token) {                       // session expired -> go to login
      const wasAdmin = storage.getUser()?.role === 'ADMIN'
      storage.clear()
      window.location.href = wasAdmin ? '/admin/login' : '/login'
    }
    throw new Error((data && data.message) || 'Request failed (' + res.status + ')')
  }
  return data
}

export const get = (path, params) => request(path, { params })
export const post = (path, body) => request(path, { method: 'POST', body: body ?? {} })
export const put = (path, body) => request(path, { method: 'PUT', body: body ?? {} })
export const patch = (path, params) => request(path, { method: 'PATCH', params })
export const del = (path) => request(path, { method: 'DELETE' })
