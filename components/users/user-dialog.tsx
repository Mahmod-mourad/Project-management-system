"use client"

import { useState } from "react"

import type { CreateUserInput, TenantRole, User } from "@/lib/types"
import { TENANT_ROLE_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserDialogProps {
  open: boolean
  /** The user being edited, or null to add somebody new. */
  user: User | null
  /** Only an administrator may set a role; the API drops it from anyone else. */
  canSetRole: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Partial<User>) => Promise<void>
  onCreate: (values: CreateUserInput) => Promise<void>
}

const ROLES: TenantRole[] = ["admin", "manager", "member"]

/** The API requires at least 8 characters, so the form should not let a shorter one through. */
const MIN_PASSWORD_LENGTH = 8

export function UserDialog({
  open,
  user,
  canSetRole,
  onOpenChange,
  onSubmit,
  onCreate,
}: UserDialogProps) {
  const isNew = user === null

  const [values, setValues] = useState(() => ({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
    role: user?.role ?? ("member" as TenantRole),
    password: "",
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setSubmitting(true)
    setError(null)

    try {
      if (isNew) {
        if (values.password.length < MIN_PASSWORD_LENGTH) {
          throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        }

        await onCreate({
          email: values.email.trim(),
          password: values.password,
          full_name: values.full_name.trim(),
          role: values.role,
          phone: values.phone.trim() || undefined,
          department: values.department.trim() || undefined,
        })
      } else {
        // Blank optional fields are omitted rather than sent as "". The API
        // validates email with @IsEmail, which rejects an empty string.
        await onSubmit({
          full_name: values.full_name.trim() || undefined,
          email: values.email.trim() || undefined,
          phone: values.phone.trim() || undefined,
          department: values.department.trim() || undefined,
          ...(canSetRole ? { role: values.role } : {}),
        })
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the user")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add user" : "Edit user"}</DialogTitle>
          {isNew && (
            <DialogDescription>
              They are added to this tenant and can sign in straight away.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              required={isNew}
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
              required={isNew}
              value={values.email}
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          {isNew && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={values.password}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, password: event.target.value }))
                }
              />
              <p className="text-sm text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters. Share it with them to sign in first time.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
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

          {canSetRole && (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={values.role}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, role: value as TenantRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {TENANT_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isNew ? "Add user" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
