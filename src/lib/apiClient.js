import axios from 'axios'
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from './tokenStorage'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests = []

function subscribeTokenRefresh(callback) {
  pendingRequests.push(callback)
}

function onRefreshed(newToken) {
  pendingRequests.forEach((cb) => cb(newToken))
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => {
    const maybeWrapped = response?.data
    const isWrapped =
      maybeWrapped && typeof maybeWrapped === 'object' && 'success' in maybeWrapped && 'data' in maybeWrapped

    if (isWrapped) {
      const { success, message, data } = maybeWrapped
      Object.defineProperty(response, '_message', { value: message, enumerable: false })
      if (success !== true) {
        const err = new Error(message || 'İşlem başarısız')
        err.response = response
        throw err
      }
      response.data = data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      try {
        isRefreshing = true
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await api.post('/auth/refresh-token', null, {
          params: { refreshToken },
        })
        const newAccessToken = data?.data?.accessToken || data?.accessToken
        if (!newAccessToken) throw new Error('No access token in refresh response')
        setAccessToken(newAccessToken)
        onRefreshed(newAccessToken)
        return api(originalRequest)
      } catch (e) {
        clearTokens()
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    const body = error?.response?.data
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      const message = body?.message || 'İşlem başarısız'
      const normalized = new Error(message)
      normalized.response = error.response
      return Promise.reject(normalized)
    }

    return Promise.reject(error)
  }
)

export default api


