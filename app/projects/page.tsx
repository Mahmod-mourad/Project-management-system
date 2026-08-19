"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProjectsManagement } from "@/components/projects/projects-management"

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProjectsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
