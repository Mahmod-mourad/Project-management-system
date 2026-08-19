"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"

import { useProjects } from "@/hooks/use-projects"
import type { Project } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProjectDialog } from "./project-dialog"

const STATUS_LABELS: Record<Project["status"], string> = {
  planning: "Planning",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_VARIANTS: Record<Project["status"], "default" | "secondary" | "outline" | "destructive"> = {
  planning: "outline",
  in_progress: "default",
  on_hold: "secondary",
  completed: "secondary",
  cancelled: "destructive",
}

const PRIORITY_VARIANTS: Record<Project["priority"], "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

export function ProjectsManagement() {
  const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject } =
    useProjects()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editing, setEditing] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesSearch =
        term === "" ||
        project.name.toLowerCase().includes(term) ||
        (project.description ?? "").toLowerCase().includes(term)

      return matchesStatus && matchesSearch
    })
  }, [projects, search, statusFilter])

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? Its tasks will be removed with it.`)) return

    try {
      await deleteProject(project.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete the project")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Everything your tenant is working on.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProjects} disabled={loading}>
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
            New project
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          {/* The API failing is shown as a failure. It is never papered over with
              sample rows — a screen that invents data is worse than one that says
              it could not load. */}
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {projects.length === 0
                ? "No projects yet. Create the first one."
                : "No projects match those filters."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[project.status]}>
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANTS[project.priority]}>{project.priority}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(project)
                          setDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(project)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProjectDialog
        open={dialogOpen}
        project={editing}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          if (editing) {
            await updateProject(editing.id, values)
          } else {
            await createProject(values)
          }
        }}
      />
    </div>
  )
}
