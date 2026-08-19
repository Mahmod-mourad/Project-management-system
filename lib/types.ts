/**
 * Shapes the API returns.
 *
 * These mirror the DTOs in backend/src — the enums here are the same strings the
 * NestJS validators accept, so a value that type-checks is a value the API will
 * take.
 */

export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled"
export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed" | "cancelled"
export type Priority = "low" | "medium" | "high" | "urgent"

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: Priority
  start_date: string | null
  end_date: string | null
  tenant_id: string
  manager_id: string | null
  created_at: string
  updated_at: string
}

/** Exactly what ProjectService.getProjectStats returns — camelCase, unlike the rows. */
export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  teamMembers: number
  completionRate: number
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  project_id: string | null
  assignee_id: string | null
  due_date: string | null
  tenant_id: string
  created_at: string
  updated_at: string
}

export type TenantRole = "admin" | "manager" | "member"

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  department: string | null
  role: TenantRole
  tenant_id: string
  created_at: string
  updated_at: string | null
}

/** What POST /users takes. No tenant_id — the API uses the caller's. */
export interface CreateUserInput {
  email: string
  password: string
  full_name: string
  role?: TenantRole
  phone?: string
  department?: string
}

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
}

export interface CreateProjectInput {
  name: string
  description?: string
  status?: ProjectStatus
  priority?: Priority
  start_date?: string
  end_date?: string
  manager_id?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  project_id?: string
  assignee_id?: string
  due_date?: string
}

/** Labels for the UI. Keys are the values the API stores. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

/** The columns the task board shows, in order. Cancelled tasks are not on the board. */
export const BOARD_COLUMNS: TaskStatus[] = ["todo", "in_progress", "in_review", "completed"]

export type TenantStatus = "active" | "suspended" | "cancelled"

export interface Tenant {
  id: string
  name: string
  domain: string | null
  status: TenantStatus
  settings: Record<string, unknown> | null
  created_at: string
}

export interface TenantStats {
  users: number
  projects: number
  tasks: number
}

export interface CreateTenantInput {
  name: string
  domain?: string
  status?: TenantStatus
}

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  cancelled: "Cancelled",
}
