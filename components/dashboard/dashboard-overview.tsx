"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertCircle, FolderKanban, ListChecks, RefreshCw } from "lucide-react"

import { useProjects } from "@/hooks/use-projects"
import { useTasks, type Task } from "@/hooks/use-tasks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The dashboard is derived entirely from the projects and tasks the API returns.
 *
 * It used to fetch /api/reports/sales-data — a route that does not exist in this
 * project — and fall back to numbers generated in the browser, charting revenue
 * and inventory for an application that manages projects and tasks.
 */

const STATUS_COLOURS: Record<string, string> = {
  todo: "hsl(215 20% 65%)",
  in_progress: "hsl(221 83% 53%)",
  in_review: "hsl(38 92% 50%)",
  completed: "hsl(142 71% 45%)",
  cancelled: "hsl(0 72% 51%)",
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  completed: "Completed",
  cancelled: "Cancelled",
}

/** Due today is on time. Only a date already past counts as overdue. */
function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "completed" || task.status === "cancelled") return false

  const due = new Date(task.due_date)
  due.setHours(23, 59, 59, 999)

  return due.getTime() < Date.now()
}

export function DashboardOverview() {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchProjects,
  } = useProjects()
  const { tasks, loading: tasksLoading, error: tasksError, fetchTasks } = useTasks()

  const loading = projectsLoading || tasksLoading
  const error = projectsError ?? tasksError

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (project) => project.status === "in_progress" || project.status === "planning",
    ).length

    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const overdueTasks = tasks.filter(isOverdue).length

    return {
      totalProjects: projects.length,
      activeProjects,
      totalTasks: tasks.length,
      completedTasks,
      overdueTasks,
      // Guarded against an empty task list, which would otherwise be NaN.
      completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
    }
  }, [projects, tasks])

  const tasksByStatus = useMemo(() => {
    const counts = new Map<string, number>()

    for (const task of tasks) {
      counts.set(task.status, (counts.get(task.status) ?? 0) + 1)
    }

    return [...counts.entries()].map(([status, value]) => ({
      status,
      name: STATUS_LABELS[status] ?? status,
      value,
    }))
  }, [tasks])

  const tasksPerProject = useMemo(() => {
    const counts = new Map<string, number>()

    for (const task of tasks) {
      if (!task.project_id) continue
      counts.set(task.project_id, (counts.get(task.project_id) ?? 0) + 1)
    }

    return projects
      .map((project) => ({ name: project.name, tasks: counts.get(project.id) ?? 0 }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 6)
  }, [projects, tasks])

  const upcoming = useMemo(
    () =>
      tasks
        .filter((task) => task.due_date && task.status !== "completed" && task.status !== "cancelled")
        .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
        .slice(0, 5),
    [tasks],
  )

  const tiles = [
    { label: "Projects", value: stats.totalProjects, hint: `${stats.activeProjects} active` },
    { label: "Tasks", value: stats.totalTasks, hint: `${stats.completedTasks} completed` },
    { label: "Completion", value: `${stats.completionRate}%`, hint: "of all tasks" },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      hint: stats.overdueTasks ? "needs attention" : "nothing late",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Where your projects and tasks stand right now.</p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            fetchProjects()
            fetchTasks()
          }}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <p className="text-3xl font-bold">{tile.value}</p>
                  <p className="text-xs text-muted-foreground">{tile.hint}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : tasksByStatus.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={tasksByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {tasksByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLOURS[entry.status] ?? "hsl(215 20% 65%)"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks per project</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : tasksPerProject.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No projects yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tasksPerProject}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Coming up</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">All tasks</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing scheduled. Tasks with a due date show up here.
            </p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(task.due_date as string).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue(task) && <Badge variant="destructive">Overdue</Badge>}
                    <Badge variant="secondary">{STATUS_LABELS[task.status] ?? task.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button variant="outline" className="h-auto justify-start gap-3 py-4" asChild>
          <Link href="/projects">
            <FolderKanban className="h-5 w-5" />
            <span className="text-left">
              <span className="block font-medium">Projects</span>
              <span className="block text-xs text-muted-foreground">Create and track work</span>
            </span>
          </Link>
        </Button>

        <Button variant="outline" className="h-auto justify-start gap-3 py-4" asChild>
          <Link href="/tasks">
            <ListChecks className="h-5 w-5" />
            <span className="text-left">
              <span className="block font-medium">Task board</span>
              <span className="block text-xs text-muted-foreground">Move work across columns</span>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
