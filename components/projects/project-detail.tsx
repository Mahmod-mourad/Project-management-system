"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"

import { apiClient } from "@/lib/api-client"
import type { Project, ProjectStats } from "@/lib/types"

import { TaskBoard } from "@/components/tasks/task-board"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        // Both come from the API. The completion figure is computed server-side
        // from the task rows, not guessed in the browser.
        const [projectData, statsData] = await Promise.all([
          apiClient.getProject(projectId),
          apiClient.getProjectStats(projectId),
        ])

        if (cancelled) return

        setProject(projectData)
        setStats(statsData)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not load the project")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error ?? "Project not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  const tiles = [
    { label: "Tasks", value: stats?.totalTasks ?? 0 },
    { label: "Completed", value: stats?.completedTasks ?? 0 },
    { label: "Team members", value: stats?.teamMembers ?? 0 },
    { label: "Completion", value: `${stats?.completionRate ?? 0}%` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="secondary">{project.status.replace("_", " ")}</Badge>
          <Badge variant="outline">{project.priority}</Badge>
        </div>

        {project.description && (
          <p className="mt-2 max-w-3xl text-muted-foreground">{project.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={stats?.completionRate ?? 0} />
          <p className="text-sm text-muted-foreground">
            {stats?.completedTasks ?? 0} of {stats?.totalTasks ?? 0} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Scoped to this project — the board passes project_id straight to
          GET /tasks?project_id=, which the API already supported. */}
      <TaskBoard projectId={projectId} title="Project tasks" />
    </div>
  )
}
