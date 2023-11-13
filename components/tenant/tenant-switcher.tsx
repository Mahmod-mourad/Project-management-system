"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTenant } from "@/lib/tenant-context"

const availableTenants = [
  {
    id: "1",
    name: "شركة التقنية المتقدمة",
    subdomain: "advanced-tech",
    plan: "Enterprise",
  },
  {
    id: "2",
    name: "مؤسسة الأعمال الذكية",
    subdomain: "smart-business",
    plan: "Professional",
  },
  {
    id: "3",
    name: "شركة الحلول المبتكرة",
    subdomain: "innovative-solutions",
    plan: "Starter",
  },
]

export default function TenantSwitcher() {
  const { tenant, setTenant } = useTenant()
  const [open, setOpen] = useState(false)

  const handleTenantSelect = (selectedTenant: (typeof availableTenants)[0]) => {
    setTenant({
      id: selectedTenant.id,
      name: selectedTenant.name,
      subdomain: selectedTenant.subdomain,
      status: "active",
      settings: {},
    })
    localStorage.setItem("current_tenant_id", selectedTenant.id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{tenant ? tenant.name : "اختر الشركة..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="البحث عن شركة..." />
          <CommandList>
            <CommandEmpty>لا توجد شركات.</CommandEmpty>
            <CommandGroup>
              {availableTenants.map((tenantOption) => (
                <CommandItem
                  key={tenantOption.id}
                  value={tenantOption.name}
                  onSelect={() => handleTenantSelect(tenantOption)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Check className={cn("h-4 w-4", tenant?.id === tenantOption.id ? "opacity-100" : "opacity-0")} />
                      <div>
                        <p className="font-medium">{tenantOption.name}</p>
                        <p className="text-sm text-muted-foreground">{tenantOption.subdomain}.erp.com</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tenantOption.plan}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
