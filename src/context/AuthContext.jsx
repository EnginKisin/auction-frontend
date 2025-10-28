import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/apiClient'
import { jwtDecode } from 'jwt-decode'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../lib/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ email: decoded?.sub || decoded?.email || null })
      } catch {
        //
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const data = res?.data
    const accessToken = data?.accessToken
    const refreshToken = data?.refreshToken
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    try {
      const decoded = jwtDecode(accessToken)
      setUser({ email: decoded?.sub || decoded?.email || email })
    } catch {
      setUser({ email })
    }
  }, [])

  const logout = useCallback(async () => {
    const token = getAccessToken()
    try {
      if (token) {
        await api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } })
      }
    } catch {
      //
    }
    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, logout }),
    [user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


