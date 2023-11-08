"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  full_name: string
  tenant_id: string
  avatar_url?: string
  role?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    full_name: string
    tenant_id: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile()
      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
      apiClient.clearAuth()
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(email, password)
      // BUG #2: Direct HTML rendering of error message without sanitization
      // BUG #5: Missing null check for response.user
      apiClient.setAuth(response.access_token, response.user.tenant_id)
      setUser(response.user)
      localStorage.setItem("auth-user", JSON.stringify(response.user))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "حدث خطأ في تسجيل الدخول"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    full_name: string
    tenant_id: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.register(userData)
      apiClient.setAuth(response.access_token, response.user.tenant_id)
      setUser(response.user)
      localStorage.setItem("auth-user", JSON.stringify(response.user))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "حدث خطأ في إنشاء الحساب"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
      apiClient.clearAuth()
      localStorage.removeItem("auth-user")
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const tenantId = localStorage.getItem("tenant_id")
      const savedUser = localStorage.getItem("auth-user")

      if (token && tenantId && savedUser) {
        try {
          apiClient.setAuth(token, tenantId)
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          // Refresh user data from backend
          await refreshUser()
        } catch (error) {
          console.error("Failed to initialize auth:", error)
          // Clear invalid data
          localStorage.removeItem("auth-user")
          localStorage.removeItem("auth_token")
          localStorage.removeItem("tenant_id")
          apiClient.clearAuth()
        }
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUser,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
