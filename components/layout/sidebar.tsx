"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  User,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Every entry here maps to endpoints the API actually serves. The sidebar used
// to list inventory, sales, invoices, HR and reports — five modules the backend
// has never had, each opening a screen built entirely from hardcoded arrays.
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: ListChecks, label: "Tasks", href: "/tasks" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Building2, label: "Tenants", href: "/admin/tenants" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 h-screen bg-sidebar border-l border-sidebar-border transition-all duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {isOpen && <h1 className="text-lg font-bold text-sidebar-foreground">نظام ERP</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                    !isOpen && "justify-center px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isOpen && "ml-2")} />
                  {isOpen && <span className="text-right">{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {isOpen && <div className="text-xs text-sidebar-foreground/60 text-center">الإصدار 1.0.0</div>}
        </div>
      </div>
    </div>
  )
}
