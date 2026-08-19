"use client"

import { useState } from "react"

import type { CreateTaskInput, Project, Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TaskDialogProps {
  open: boolean
  task: Task | null
  projects: Project[]
  defaultProjectId?: string
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateTaskInput) => Promise<void>
}

const STATUSES: Task["status"][] = ["todo", "in_progress", "in_review", "completed", "cancelled"]
const PRIORITIES: Task["priority"][] = ["low", "medium", "high", "urgent"]

// The project select needs a non-empty value for "no project", because Radix
// treats an empty string as "nothing selected" and refuses to render it.
const NO_PROJECT = "__none__"

export function TaskDialog({
  open,
  task,
  projects,
  defaultProjectId,
  onOpenChange,
  onSubmit,
}: TaskDialogProps) {
  const [values, setValues] = useState(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? ("todo" as Task["status"]),
    priority: task?.priority ?? ("medium" as Task["priority"]),
    project_id: task?.project_id ?? defaultProjectId ?? NO_PROJECT,
    due_date: task?.due_date?.slice(0, 10) ?? "",
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (values.title.trim() === "") {
      setError("A task needs a title")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Blank optional fields are omitted. The API validates project_id as a UUID
      // and due_date as a date string, so sending "" fails the whole request.
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        status: values.status,
        priority: values.priority,
        project_id: values.project_id === NO_PROJECT ? undefined : values.project_id,
        due_date: values.due_date || undefined,
      })

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the task")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={values.project_id}
              onValueChange={(value) => setValues((prev) => ({ ...prev, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, status: value as Task["status"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={values.priority}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, priority: value as Task["priority"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input
              id="due_date"
              type="date"
              value={values.due_date}
              onChange={(event) => setValues((prev) => ({ ...prev, due_date: event.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
