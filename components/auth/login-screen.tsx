"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/components/auth/auth-provider"

/**
 * The sign-in screen.
 *
 * This lives here rather than in app/login/page.tsx because ProtectedRoute
 * renders it inline for signed-out visitors. A route file may only export a
 * default, so importing the page component from another component broke the
 * build once type checking was switched on.
 */
export function LoginScreen() {
  const { login, isLoading, error } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary">Project Management</h1>
          <p className="text-muted-foreground">Multi-tenant projects and tasks</p>
        </div>
        <LoginForm onLogin={login} isLoading={isLoading} error={error ?? undefined} />
      </div>
    </div>
  )
}
