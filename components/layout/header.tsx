"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { NotificationSystem } from "@/components/ui/notification-system"
import { TENANT_ROLE_LABELS } from "@/lib/types"
import Link from "next/link"

/**
 * The top bar: notifications and the account menu.
 *
 * The search box that used to sit on the left is gone. There is no search
 * endpoint on the API and never has been, so typing in it did nothing at all.
 */
export function Header() {
  const { user, logout } = useAuth()

  const displayName = user?.full_name || user?.email || ""

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-end gap-4 px-6">
      <NotificationSystem />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* The API returns full_name; there is no avatar field. */}
              <AvatarFallback>{(displayName || "?").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              {user?.role && (
                <p className="pt-1 text-xs leading-none text-muted-foreground">
                  {TENANT_ROLE_LABELS[user.role]}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
