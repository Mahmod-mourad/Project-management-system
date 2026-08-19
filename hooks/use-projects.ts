"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { CreateProjectInput, Project } from "@/lib/types"

export type { Project }


export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Reloads from the API. Used by the refresh button and after a mutation. */
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: CreateProjectInput) => {
    try {
      const newProject = await apiClient.createProject(projectData)
      setProjects((prev) => [newProject, ...prev])
      return newProject
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create project")
    }
  }

  const updateProject = async (id: string, projectData: Partial<CreateProjectInput>) => {
    try {
      const updatedProject = await apiClient.updateProject(id, projectData)
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)))
      return updatedProject
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update project")
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete project")
    }
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await apiClient.getProjects()
        if (!cancelled) {
          setProjects(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch projects")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
