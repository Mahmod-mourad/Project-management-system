"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ReportsManagement } from "@/components/reports/reports-management"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReportsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
