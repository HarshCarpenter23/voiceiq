import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ClientOnly } from "@/components/client-only"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audio Analysis Dashboard",
  description: "Upload audio files and view generated reports",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              <div className="flex h-screen w-[100%]">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto w-full">{children}</main>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  )
}
