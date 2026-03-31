import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useFlash } from './FlashContext'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showFlash } = useFlash()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me().then(setUser).catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    showFlash(data.message, 'success')
    return data
  }

  const register = async (formData) => {
    const data = await authAPI.register(formData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    showFlash(data.message, 'success')
    return data
  }

  const logout = async () => {
    try {
      await authAPI.logout({ refresh: localStorage.getItem('refresh_token') })
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    showFlash('You have been logged out.', 'info')
  }

  const updateProfile = async (data) => {
    const result = await authAPI.updateProfile(data)
    setUser(result.user)
    showFlash(result.message, 'success')
    return result
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)