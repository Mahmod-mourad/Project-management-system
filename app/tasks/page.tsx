"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { TaskBoard } from "@/components/tasks/task-board"

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TaskBoard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
