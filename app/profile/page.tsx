"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfileManagement } from "@/components/profile/profile-management"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
