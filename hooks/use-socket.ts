"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/components/auth/auth-provider"

export function useSocket(namespace = "") {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const token = localStorage.getItem("auth_token")
    if (!token) return

    const socketInstance = io(
      `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3001"}${namespace}`,
      {
        auth: {
          token,
        },
        transports: ["websocket"],
      },
    )

    socketInstance.on("connect", () => {
      console.log(`Connected to ${namespace || "default"} namespace`)
    })

    socketInstance.on("disconnect", () => {
      console.log(`Disconnected from ${namespace || "default"} namespace`)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user, namespace])

  return socket
}
