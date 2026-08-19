"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SettingsManagement } from "@/components/settings/settings-management"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SettingsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
