"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  start_date?: string
  end_date?: string
  manager_id?: string
  tenant_id: string
  created_at: string
  updated_at: string
  tasks?: { count: number }[]
  team_members?: Array<{
    user: {
      id: string
      full_name: string
      email: string
    }
  }>
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProjects()
      setProjects(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const newProject = await apiClient.createProject(projectData)
      setProjects((prev) => [newProject, ...prev])
      return newProject
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create project")
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const updatedProject = await apiClient.updateProject(id, projectData)
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)))
      return updatedProject
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update project")
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete project")
    }
  }

  useEffect(() => {
    fetchProjects()
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
