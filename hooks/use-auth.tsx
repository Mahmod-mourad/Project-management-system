"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  full_name: string
  tenant_id: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    full_name: string
    tenant_id: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
    try {
      const response = await apiClient.login(email, password)
      apiClient.setAuth(response.access_token, response.user.tenant_id)
      setUser(response.user)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    full_name: string
    tenant_id: string
  }) => {
    try {
      const response = await apiClient.register(userData)
      apiClient.setAuth(response.access_token, response.user.tenant_id)
      setUser(response.user)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
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
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const tenantId = localStorage.getItem("tenant_id")

      if (token && tenantId) {
        apiClient.setAuth(token, tenantId)
        await refreshUser()
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
