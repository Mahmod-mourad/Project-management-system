"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { CreateTaskInput, Task } from "@/lib/types"

export type { Task }


export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Reloads from the API. Used by the refresh button and after a mutation. */
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTasks(projectId)
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: CreateTaskInput) => {
    try {
      const newTask = await apiClient.createTask(taskData)
      setTasks((prev) => [newTask, ...prev])
      return newTask
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create task")
    }
  }

  const updateTask = async (id: string, taskData: Partial<CreateTaskInput>) => {
    try {
      const updatedTask = await apiClient.updateTask(id, taskData)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
      return updatedTask
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update task")
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await apiClient.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete task")
    }
  }

  const getTasksByStatus = async () => {
    try {
      return await apiClient.getTasksByStatus()
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to fetch task statistics")
    }
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await apiClient.getTasks(projectId)
        if (!cancelled) {
          setTasks(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch tasks")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
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
