import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { TenantProvider } from "@/lib/tenant-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "نظام إدارة الأعمال المتكامل | ERP System",
  description: "نظام إدارة الأعمال المتكامل مع دعم اللغة العربية - Complete ERP System with Arabic Support",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <TenantProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </TenantProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
