"use client"

import { useState } from "react"
import { AlertCircle, Building2, Calendar, Mail, Phone, Shield } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { apiClient } from "@/lib/api-client"
import { TENANT_ROLE_LABELS } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The signed-in user's own profile.
 *
 * Everything here comes from GET /auth/profile and is saved with
 * PATCH /users/:id, which the API allows against your own row.
 *
 * What this screen used to show: a hardcoded name, phone, position, department,
 * address, join date and biography; toggles for email, push and SMS
 * notifications; two-factor authentication, login alerts and a session timeout;
 * and a "change password" form. None of it was connected to anything — Save
 * called console.log — and none of it exists on the API. Position, address and
 * biography are not columns; there is no notification preference table, no
 * two-factor support, and no password-change endpoint. They are gone rather
 * than left on screen pretending.
 */
export function ProfileManagement() {
  const { user, refreshUser } = useAuth()

  const [values, setValues] = useState({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const displayName = user.full_name?.trim() || user.email

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      // Blank optional fields are omitted rather than sent as "". The API
      // validates email with @IsEmail, which rejects an empty string.
      await apiClient.updateUser(user.id, {
        full_name: values.full_name.trim() || undefined,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        department: values.department.trim() || undefined,
      })

      await refreshUser()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your account details.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{displayName}</CardTitle>
            <CardDescription className="flex justify-center">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role ? TENANT_ROLE_LABELS[user.role] : "Member"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{user.department}</span>
              </div>
            )}
            {user.is_platform_admin && (
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Platform administrator</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-muted-foreground">Tenant {user.tenant_id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit your details</CardTitle>
            <CardDescription>
              Your role is set by an administrator and cannot be changed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    value={values.full_name}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, full_name: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={values.phone}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={values.department}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, department: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
