"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Building2, FolderKanban, ListChecks, Users } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { apiClient } from "@/lib/api-client"
import { TENANT_STATUS_LABELS, type Tenant, type TenantStats } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The organisation this account belongs to.
 *
 * GET /tenants/:id and GET /tenants/:id/stats are the only tenant routes a
 * member may call, and both are read-only for them — changing a tenant needs a
 * platform administrator, who does it from the Tenants screen. So this page
 * reports; it does not edit.
 *
 * It used to be four tabs of company details, user preferences, notification
 * toggles and system settings — tax number, commercial register, currency,
 * fiscal year start, backup frequency, session timeout, maximum login attempts.
 * Every field was a useState initialised to an invented value, every Save was a
 * console.log, and not one of them corresponds to a column or an endpoint.
 */
export function SettingsManagement() {
  const { user } = useAuth()

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [stats, setStats] = useState<TenantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.tenant_id) return

    let cancelled = false
    const tenantId = user.tenant_id

    const load = async () => {
      try {
        // Stats are a separate request and a nice-to-have: if they fail, the
        // page still shows who you belong to.
        const [tenantResult, statsResult] = await Promise.allSettled([
          apiClient.getTenant(tenantId),
          apiClient.getTenantStats(tenantId),
        ])

        if (cancelled) return

        if (tenantResult.status === "fulfilled") {
          setTenant(tenantResult.value)
          setError(null)
        } else {
          setError(
            tenantResult.reason instanceof Error
              ? tenantResult.reason.message
              : "Could not load your organisation",
          )
        }

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user?.tenant_id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">The organisation this account belongs to.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        tenant && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {tenant.name}
                </CardTitle>
                <CardDescription>
                  Only a platform administrator can change these.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Detail label="Domain" value={tenant.domain || "—"} />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={tenant.status === "active" ? "default" : "destructive"}>
                    {TENANT_STATUS_LABELS[tenant.status]}
                  </Badge>
                </div>
                <Detail
                  label="Created"
                  value={
                    tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : "—"
                  }
                />
              </CardContent>
            </Card>

            {stats && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={<Users className="h-4 w-4" />} label="Users" value={stats.users} />
                <StatCard
                  icon={<FolderKanban className="h-4 w-4" />}
                  label="Projects"
                  value={stats.projects}
                />
                <StatCard
                  icon={<ListChecks className="h-4 w-4" />}
                  label="Tasks"
                  value={stats.tasks}
                />
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
