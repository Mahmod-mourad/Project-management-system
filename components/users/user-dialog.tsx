"use client"

import { useState } from "react"

import type { User } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserDialogProps {
  open: boolean
  user: User | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Partial<User>) => Promise<void>
}

const ROLES = ["admin", "manager", "member"]

export function UserDialog({ open, user, onOpenChange, onSubmit }: UserDialogProps) {
  const [values, setValues] = useState(() => ({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
    role: user?.role ?? "member",
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setSubmitting(true)
    setError(null)

    try {
      // Blank optional fields are omitted rather than sent as "". The API
      // validates email with @IsEmail, which rejects an empty string.
      await onSubmit({
        full_name: values.full_name.trim() || undefined,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        department: values.department.trim() || undefined,
        role: values.role,
      })

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
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

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

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={values.role}
              onValueChange={(value) => setValues((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
