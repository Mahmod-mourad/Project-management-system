"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { LoginScreen } from "./login-screen"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <LoginScreen />
  }

  return <>{children}</>
}
