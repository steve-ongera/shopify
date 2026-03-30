const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleResponse = async (res) => {
  if (res.status === 401) {
    // Try token refresh
    const refreshed = await refreshToken()
    if (!refreshed) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data
}

const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('access_token', data.access)
      return true
    }
    return false
  } catch {
    return false
  }
}

const request = async (method, path, body = null, auth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(auth ? getAuthHeader() : {})
  }
  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, config)
  return handleResponse(res)
}

// Auth
export const authAPI = {
  register: (data) => request('POST', '/auth/register/', data),
  login: (data) => request('POST', '/auth/login/', data),
  logout: (data) => request('POST', '/auth/logout/', data, true),
  me: () => request('GET', '/auth/me/', null, true),
  updateProfile: (data) => request('PUT', '/auth/update_profile/', data, true),
}

// Categories
export const categoryAPI = {
  list: (params = '') => request('GET', `/categories/${params}`),
  detail: (slug) => request('GET', `/categories/${slug}/`),
}

// Products
export const productAPI = {
  list: (params = '') => request('GET', `/products/${params}`),
  detail: (slug) => request('GET', `/products/${slug}/`),
  related: (slug) => request('GET', `/products/${slug}/related/`),
  search: (q) => request('GET', `/products/search/?q=${encodeURIComponent(q)}`),
  review: (slug, data) => request('POST', `/products/${slug}/review/`, data, true),
}

// Pickup Stations
export const pickupAPI = {
  list: (params = '') => request('GET', `/pickup-stations/${params}`),
  detail: (slug) => request('GET', `/pickup-stations/${slug}/`),
}

// Cart
export const cartAPI = {
  get: () => request('GET', '/cart/', null, true),
  add: (data) => request('POST', '/cart/add/', data, true),
  updateItem: (data) => request('PUT', '/cart/update_item/', data, true),
  removeItem: (itemId) => request('DELETE', `/cart/remove_item/?item_id=${itemId}`, null, true),
  clear: () => request('DELETE', '/cart/clear/', null, true),
}

// Orders
export const orderAPI = {
  list: () => request('GET', '/orders/', null, true),
  detail: (id) => request('GET', `/orders/${id}/`, null, true),
  create: (data) => request('POST', '/orders/', data, true),
  cancel: (id) => request('POST', `/orders/${id}/cancel/`, {}, true),
}