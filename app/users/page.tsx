"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserManagement } from "@/components/users/user-management"

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
