"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"

import { useTasks } from "@/hooks/use-tasks"
import type { Task } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskDialog } from "./task-dialog"

const COLUMNS: { status: Task["status"]; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "in_review", label: "In review" },
  { status: "completed", label: "Completed" },
]

const PRIORITY_VARIANTS: Record<Task["priority"], "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
}

/** Due today counts as on time. Only a date strictly in the past is overdue. */
function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "completed" || task.status === "cancelled") return false

  const due = new Date(task.due_date)
  due.setHours(23, 59, 59, 999)

  return due.getTime() < Date.now()
}

interface TaskBoardProps {
  /** Restricts the board to one project and preselects it on the new-task form. */
  projectId?: string
  title?: string
}

export function TaskBoard({ projectId, title = "Tasks" }: TaskBoardProps) {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } =
    useTasks(projectId)
  const { projects } = useProjects()

  const [editing, setEditing] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState("all")

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  )

  const visible = useMemo(
    () => tasks.filter((task) => priorityFilter === "all" || task.priority === priorityFilter),
    [tasks, priorityFilter],
  )

  const byStatus = useMemo(() => {
    const grouped = new Map<Task["status"], Task[]>()
    for (const column of COLUMNS) grouped.set(column.status, [])

    for (const task of visible) {
      grouped.get(task.status)?.push(task)
    }

    return grouped
  }, [visible])

  const moveTask = async (task: Task, status: Task["status"]) => {
    try {
      await updateTask(task.id, { status })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not move the task")
    }
  }

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return

    try {
      await deleteTask(task.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete the task")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {visible.length} {visible.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchTasks} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnTasks = byStatus.get(column.status) ?? []

          return (
            <Card key={column.status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  {column.label}
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : columnTasks.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Nothing here</p>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="space-y-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left text-sm font-medium hover:underline"
                          onClick={() => {
                            setEditing(task)
                            setDialogOpen(true)
                          }}
                        >
                          {task.title}
                        </button>
                        <Badge variant={PRIORITY_VARIANTS[task.priority]}>{task.priority}</Badge>
                      </div>

                      {!projectId && task.project_id && (
                        <p className="text-xs text-muted-foreground">
                          {projectNames.get(task.project_id) ?? "Unassigned project"}
                        </p>
                      )}

                      {task.due_date && (
                        <p
                          className={`text-xs ${
                            isOverdue(task) ? "font-medium text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          Due {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue(task) && " · overdue"}
                        </p>
                      )}

                      <div className="flex items-center gap-1 pt-1">
                        <Select
                          value={task.status}
                          onValueChange={(value) => moveTask(task, value as Task["status"])}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLUMNS.map((option) => (
                              <SelectItem key={option.status} value={option.status}>
                                {option.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleDelete(task)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        task={editing}
        projects={projects}
        defaultProjectId={projectId}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          if (editing) {
            await updateTask(editing.id, values)
          } else {
            await createTask(values)
          }
        }}
      />
    </div>
  )
}
