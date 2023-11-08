"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { LoginPage } from "@/app/login/page"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
