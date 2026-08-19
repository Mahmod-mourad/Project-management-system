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

  /**
   * Reloads from the API.
   *
   * `showSpinner` is false on the first load — `loading` already starts true, and
   * setting it again synchronously inside the mount effect costs an extra render.
   */
  const fetchNotifications = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true)
      const data: Notification[] = await apiClient.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter((notification) => !notification.read).length)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to mark all notifications as read")
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
    let cancelled = false

    const load = async () => {
      try {
        const data: Notification[] = await apiClient.getNotifications()
        if (cancelled) return

        setNotifications(data)
        setUnreadCount(data.filter((notification) => !notification.read).length)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    // Nothing here is set synchronously, and a cancelled flag stops a slow
    // response writing state after the component has gone.
    return () => {
      cancelled = true
    }
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
