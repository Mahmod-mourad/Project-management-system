import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InvoicesManagement } from "@/components/invoices/invoices-management"

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoicesManagement />
    </DashboardLayout>
  )
}
