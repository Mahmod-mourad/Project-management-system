"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Plus, RefreshCw, Search } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { useUsers, type User } from "@/hooks/use-users"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserDialog } from "./user-dialog"

/** Falls back to the email when a profile has no name yet. */
function displayName(user: User): string {
  return user.full_name?.trim() || user.email
}

function initials(value: string): string {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function UserManagement() {
  const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUsers()
  const { user: currentUser } = useAuth()

  // Adding, removing and editing somebody else are administrator actions. The
  // API enforces that; this just avoids offering buttons that would 403.
  const isAdmin = currentUser?.role === "admin"

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (term === "") return users

    return users.filter(
      (user) =>
        displayName(user).toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.department ?? "").toLowerCase().includes(term),
    )
  }, [users, searchTerm])

  const handleDelete = async (user: User) => {
    if (!confirm(`Remove ${displayName(user)} from this tenant?`)) return

    try {
      await deleteUser(user.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not remove the user")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Everyone with access to this tenant.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {isAdmin && (
            <Button
              onClick={() => {
                setSelectedUser(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add user
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>
            {filtered.length} {filtered.length === 1 ? "user" : "users"}
          </CardTitle>

          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or department"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {users.length === 0 ? "No users in this tenant yet." : "Nobody matches that search."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                          <AvatarFallback>{initials(displayName(user))}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{displayName(user)}</p>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || "—"}</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {(isAdmin || currentUser?.id === user.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      {/* An administrator cannot remove their own account, so
                          the button is not there to be pressed. */}
                      {isAdmin && currentUser?.id !== user.id && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserDialog
        // Remounts when the target changes, so the form re-seeds from props
        // instead of syncing itself in an effect.
        key={selectedUser?.id ?? "new"}
        open={isDialogOpen}
        user={selectedUser}
        canSetRole={isAdmin}
        onOpenChange={setIsDialogOpen}
        onCreate={async (values) => {
          await createUser(values)
        }}
        onSubmit={async (values) => {
          if (!selectedUser) return
          await updateUser(selectedUser.id, values)
        }}
      />
    </div>
  )
}
