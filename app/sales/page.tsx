"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SalesManagement } from "@/components/sales/sales-management"

export default function SalesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SalesManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
