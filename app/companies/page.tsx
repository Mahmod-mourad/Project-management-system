import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CompaniesManagement } from "@/components/companies/companies-management"

export default function CompaniesPage() {
  return (
    <DashboardLayout>
      <CompaniesManagement />
    </DashboardLayout>
  )
}
