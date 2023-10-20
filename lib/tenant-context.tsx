"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Tenant {
  id: string
  name: string
  subdomain: string
  status: "active" | "suspended" | "cancelled"
  settings: Record<string, any>
}

interface Subscription {
  id: string
  plan: {
    name: string
    price: number
    max_users: number | null
    max_storage_gb: number
    features: string[]
  }
  status: "active" | "cancelled" | "expired" | "trial"
  trial_ends_at?: string
  current_period_end: string
}

interface TenantContextType {
  tenant: Tenant | null
  subscription: Subscription | null
  setTenant: (tenant: Tenant) => void
  setSubscription: (subscription: Subscription) => void
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize tenant context from subdomain or localStorage
    const initializeTenant = async () => {
      try {
        // In a real app, this would extract subdomain from URL
        // For demo, we'll use localStorage or default to first tenant
        const savedTenantId = localStorage.getItem("current_tenant_id")

        if (savedTenantId) {
          // Fetch tenant and subscription data
          // This would be API calls in a real app
          const mockTenant: Tenant = {
            id: savedTenantId,
            name: "شركة التقنية المتقدمة",
            subdomain: "advanced-tech",
            status: "active",
            settings: {},
          }

          const mockSubscription: Subscription = {
            id: "sub_1",
            plan: {
              name: "Enterprise",
              price: 499,
              max_users: null,
              max_storage_gb: 500,
              features: [
                "basic_crm",
                "sales_management",
                "inventory_management",
                "advanced_reports",
                "hr_management",
                "api_access",
              ],
            },
            status: "active",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }

          setTenant(mockTenant)
          setSubscription(mockSubscription)
        }
      } catch (error) {
        console.error("Failed to initialize tenant:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeTenant()
  }, [])

  return (
    <TenantContext.Provider
      value={{
        tenant,
        subscription,
        setTenant,
        setSubscription,
        isLoading,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
