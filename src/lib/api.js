const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(path, { method = 'GET', body, headers, params } = {}) {
  let url = `${API_URL}${path}`

  if (params) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, value)
      }
    })
    const query = search.toString()
    if (query) url += `?${query}`
  }

  const token = localStorage.getItem('access_token')

  const finalHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
  } catch (err) {
    throw new ApiError('Network error. Please check your internet connection.')
  }

  let data = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed (${response.status})`

    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
    }

    throw new ApiError(message, response.status, data?.errors || null)
  }

  return data
}

export const api = {
  get(path, options) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options) {
    return request(path, { ...options, method: 'DELETE' })
  },
}
