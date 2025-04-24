"use client"

import { useCurrentPath } from "@/hooks/useCurrentPath"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = useCurrentPath()
  const isLoginPage = pathname?.startsWith("/login")

  return (
    <div className="flex h-screen w-full">
      {!isLoginPage && <DashboardSidebar />}
      <main className="flex-1 overflow-auto w-full">{children}</main>
    </div>
  )
}
