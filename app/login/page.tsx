"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { login, isLoading, error, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">نظام ERP</h1>
          <p className="text-muted-foreground">نظام إدارة الأعمال المتكامل</p>
        </div>
        <LoginForm onLogin={login} isLoading={isLoading} error={error} />
      </div>
    </div>
  )
}

export { LoginPage }
