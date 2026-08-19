"use client"

import { useEffect, useState } from "react"

import { apiClient } from "@/lib/api-client"
import type { CreateUserInput, User } from "@/lib/types"

export type { User }


/**
 * Users for the current tenant.
 *
 * The tenant is not a parameter here — api-client sends it as the x-tenant-id
 * header, and the API's TenantGuard checks that header against the signed-in
 * user before the handler runs. There is no way to ask for another tenant's
 * users from this hook.
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Reloads from the API. Used by the refresh button and after a mutation. */
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setUsers(await apiClient.getUsers())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  /** Administrators only. The tenant comes from the session, not from here. */
  const createUser = async (input: CreateUserInput) => {
    try {
      const created = await apiClient.createUser(input)
      setUsers((prev) => [created, ...prev])
      return created
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create user")
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updated = await apiClient.updateUser(id, userData)
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
      return updated
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update user")
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await apiClient.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete user")
    }
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await apiClient.getUsers()
        if (!cancelled) {
          setUsers(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch users")
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

  return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser }
}
