"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

import { useAuth } from "@/components/auth/auth-provider"

/** Strips the REST prefix — socket.io connects to the server root, not /api/v1. */
function socketOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"
  return apiUrl.replace(/\/api\/v1\/?$/, "")
}

/**
 * A socket.io connection for the signed-in user, reconnected when they change.
 *
 * The socket is published to state from the "connect" callback rather than
 * straight after io() returns. That keeps the state update out of the effect
 * body — which is what React 19 objects to — and has the useful side effect that
 * callers only ever receive a socket that is actually connected.
 */
export function useSocket(namespace = "") {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem("auth_token")
    if (!token) return

    const instance = io(`${socketOrigin()}${namespace}`, {
      auth: { token },
      transports: ["websocket"],
    })

    instance.on("connect", () => setSocket(instance))
    instance.on("disconnect", () => setSocket(null))
    instance.on("connect_error", (error) => {
      console.error(`Socket connection error on ${namespace || "/"}:`, error.message)
    })

    return () => {
      instance.off()
      instance.disconnect()
    }
  }, [user, namespace])

  return socket
}
