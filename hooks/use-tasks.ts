"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "in_review" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  project_id?: string
  assignee_id?: string
  due_date?: string
  tenant_id: string
  created_at: string
  updated_at: string
  project?: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTasks(projectId)
      setTasks(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await apiClient.createTask(taskData)
      setTasks((prev) => [newTask, ...prev])
      return newTask
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create task")
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updatedTask = await apiClient.updateTask(id, taskData)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
      return updatedTask
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update task")
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await apiClient.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete task")
    }
  }

  const getTasksByStatus = async () => {
    try {
      return await apiClient.getTasksByStatus()
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to fetch task statistics")
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
  }
}
