"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import TenantManagement from "@/components/tenant/tenant-management"

export default function TenantsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TenantManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
