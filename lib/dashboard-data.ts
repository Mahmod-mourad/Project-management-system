import { apiClient } from "./api-client"
import { calculatePercentage } from "./api-utils"
import type { Project, Task, TaskStatus } from "./types"

/**
 * Everything the dashboard shows, in one call.
 *
 * This replaces lib/data-integration.ts, which was typed around users,
 * companies, products, sales, invoices and employees — six resources with no
 * endpoints behind them, feeding screens that have since been removed.
 */

export interface DashboardSummary {
  projects: Project[]
  tasks: Task[]
  totals: {
    projects: number
    activeProjects: number
    completedProjects: number
    tasks: number
    completedTasks: number
    overdueTasks: number
    completionRate: number
  }
  tasksByStatus: { status: TaskStatus; label: string; count: number }[]
  projectsByStatus: { status: string; count: number }[]
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  completed: "Completed",
  cancelled: "Cancelled",
}

function isOverdue(task: Task, today: string): boolean {
  if (!task.due_date) return false
  if (task.status === "completed" || task.status === "cancelled") return false

  // Compare as dates, not timestamps: a task due today is not late yet.
  return task.due_date.slice(0, 10) < today
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [projects, tasks] = await Promise.all([apiClient.getProjects(), apiClient.getTasks()])

  const today = new Date().toISOString().slice(0, 10)

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const overdueTasks = tasks.filter((t) => isOverdue(t, today)).length

  const projectCounts = new Map<string, number>()
  for (const project of projects) {
    projectCounts.set(project.status, (projectCounts.get(project.status) ?? 0) + 1)
  }

  return {
    projects,
    tasks,
    totals: {
      projects: projects.length,
      activeProjects: projects.filter((p) => p.status === "in_progress").length,
      completedProjects: projects.filter((p) => p.status === "completed").length,
      tasks: tasks.length,
      completedTasks,
      overdueTasks,
      completionRate: calculatePercentage(completedTasks, tasks.length),
    },
    tasksByStatus: (Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: tasks.filter((task) => task.status === status).length,
    })),
    projectsByStatus: [...projectCounts.entries()].map(([status, count]) => ({ status, count })),
  }
}
