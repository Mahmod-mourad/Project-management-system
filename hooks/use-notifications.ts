"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useSocket } from "./use-socket"

export interface Notification {
  id: string
  tenant_id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  data?: any
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const socket = useSocket("/notifications")

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get("/notifications")
      setNotifications(data.data)
      setUnreadCount(data.data.filter((n: Notification) => !n.read).length)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.post("/notifications/mark-all-read")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to mark all notifications as read")
    }
  }

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on("notification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev])
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1)
        }
      })

      return () => {
        socket.off("notification")
      }
    }
  }, [socket])

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
