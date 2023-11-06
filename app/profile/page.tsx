import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfileManagement } from "@/components/profile/profile-management"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileManagement />
    </DashboardLayout>
  )
}
