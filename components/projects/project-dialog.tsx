"use client"

import { useEffect, useState } from "react"

import type { CreateProjectInput, Project } from "@/lib/types"
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

type ProjectInput = CreateProjectInput

interface ProjectDialogProps {
  open: boolean
  project: Project | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectInput) => Promise<void>
}

const STATUSES: Project["status"][] = [
  "planning",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
]

const PRIORITIES: Project["priority"][] = ["low", "medium", "high", "urgent"]

const EMPTY = {
  name: "",
  description: "",
  status: "planning" as Project["status"],
  priority: "medium" as Project["priority"],
  start_date: "",
  end_date: "",
}

export function ProjectDialog({ open, project, onOpenChange, onSubmit }: ProjectDialogProps) {
  const [values, setValues] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setError(null)
    setValues(
      project
        ? {
            name: project.name,
            description: project.description ?? "",
            status: project.status,
            priority: project.priority,
            // <input type="date"> only accepts YYYY-MM-DD.
            start_date: project.start_date?.slice(0, 10) ?? "",
            end_date: project.end_date?.slice(0, 10) ?? "",
          }
        : EMPTY,
    )
  }, [open, project])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (values.name.trim() === "") {
      setError("A project needs a name")
      return
    }

    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      setError("The due date cannot be before the start date")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Empty strings are dropped rather than sent. The API validates dates with
      // @IsDateString, which rejects "" — sending it would fail the whole request
      // because a field was left blank.
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        status: values.status,
        priority: values.priority,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
      })

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the project")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, status: value as Project["status"] }))
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
                  setValues((prev) => ({ ...prev, priority: value as Project["priority"] }))
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={values.start_date}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, start_date: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Due date</Label>
              <Input
                id="end_date"
                type="date"
                value={values.end_date}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, end_date: event.target.value }))
                }
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
