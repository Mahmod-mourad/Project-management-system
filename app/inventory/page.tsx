"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { InventoryManagement } from "@/components/inventory/inventory-management"

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <InventoryManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
