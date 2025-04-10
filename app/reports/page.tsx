import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ReportsList } from "@/components/reports-list"

export default function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="View and download your generated reports." />
      <ReportsList />
    </DashboardShell>
  )
}
