"use client"

import { use } from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProjectDetail } from "@/components/projects/project-detail"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProjectDetail projectId={id} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
