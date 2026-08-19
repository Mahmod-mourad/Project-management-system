"use client"

import { useEffect, useState } from "react"
import { Building2, Plus } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { apiClient } from "@/lib/api-client"
import {
  TENANT_STATUS_LABELS,
  type CreateTenantInput,
  type Tenant,
  type TenantStats,
  type TenantStatus,
} from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_VARIANTS: Record<TenantStatus, "default" | "destructive" | "secondary"> = {
  active: "default",
  suspended: "destructive",
  cancelled: "secondary",
}

/**
 * Every tenant on the platform.
 *
 * The API restricts all of this to a platform administrator — the flag on the
 * profile, not a role inside a tenant. The sidebar hides the link for everyone
 * else, but the route is still typeable, so the screen says so plainly instead
 * of firing four requests that all answer 403.
 */
export default function TenantManagement() {
  const { user } = useAuth()
  const isPlatformAdmin = user?.is_platform_admin === true

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Record<string, TenantStats>>({})
  // Nothing is fetched for a non-administrator, so there is nothing to wait for.
  const [loading, setLoading] = useState(isPlatformAdmin)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateTenantInput>({ name: "", domain: "", status: "active" })

  /**
   * Fetches the tenant list plus each tenant's counts.
   *
   * Counts are one request per tenant, settled independently — a failure there
   * leaves that row's numbers blank rather than failing the whole page.
   */
  const fetchTenants = async () => {
    const list = await apiClient.getTenants()

    const results = await Promise.allSettled(
      list.map(async (tenant) => [tenant.id, await apiClient.getTenantStats(tenant.id)] as const),
    )

    const counts = Object.fromEntries(
      results
        .filter((r): r is PromiseFulfilledResult<readonly [string, TenantStats]> =>
          r.status === "fulfilled",
        )
        .map((r) => r.value),
    )

    return { list, counts }
  }

  // The initial load lives inside the effect so nothing is set synchronously when
  // it runs, and a cancelled flag stops a slow response writing state after the
  // component has gone.
  useEffect(() => {
    if (!isPlatformAdmin) return

    let cancelled = false

    fetchTenants()
      .then(({ list, counts }) => {
        if (cancelled) return
        setTenants(list)
        setStats(counts)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not load tenants")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isPlatformAdmin])

  /** Reload after a create. Not called during render, so the spinner is fine here. */
  const reload = async () => {
    setLoading(true)
    setError(null)

    try {
      const { list, counts } = await fetchTenants()
      setTenants(list)
      setStats(counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tenants")
    } finally {
      setLoading(false)
    }
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // This used to be a console.log. The dialog closed and nothing was created.
      await apiClient.createTenant({
        name: form.name.trim(),
        status: form.status,
        ...(form.domain?.trim() ? { domain: form.domain.trim() } : {}),
      })

      setDialogOpen(false)
      setForm({ name: "", domain: "", status: "active" })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the tenant")
    } finally {
      setSaving(false)
    }
  }

  if (!isPlatformAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Managing tenants requires a platform administrator. Your own organisation is on the{" "}
            <a className="underline" href="/settings">
              Settings
            </a>{" "}
            page.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">{tenants.length} on this instance</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New tenant
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tenants yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => {
            const counts = stats[tenant.id]

            return (
              <Card key={tenant.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-4 w-4" />
                      {tenant.name}
                    </CardTitle>
                    <Badge variant={STATUS_VARIANTS[tenant.status]}>
                      {TENANT_STATUS_LABELS[tenant.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tenant.domain && (
                    <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                  )}

                  {counts && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-semibold">{counts.users}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div>
                        <p className="font-semibold">{counts.projects}</p>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                      <div>
                        <p className="font-semibold">{counts.tasks}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Created {new Date(tenant.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={create}>
            <DialogHeader>
              <DialogTitle>New tenant</DialogTitle>
              <DialogDescription>
                Each tenant is an isolated customer. Users, projects and tasks never cross
                between them.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Name</Label>
                <Input
                  id="tenant-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant-domain">Domain</Label>
                <Input
                  id="tenant-domain"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  placeholder="acme.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value as TenantStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TENANT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? "Creating…" : "Create tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
