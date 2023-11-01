import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { HRManagement } from "@/components/hr/hr-management"

export default function HRPage() {
  return (
    <DashboardLayout>
      <HRManagement />
    </DashboardLayout>
  )
}
