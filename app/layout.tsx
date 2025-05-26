// app/layout.tsx
import "./globals.css"
import { Archivo } from "next/font/google"
import { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/components/dashboard-sidebar"


const archivo = Archivo({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audio Analysis Dashboard",
  description: "Upload audio files and view generated reports",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
<html
  lang="en"
  className="light"
  style={{ colorScheme: "light" }}
>

      <body className={archivo.className}>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <DashboardSidebar />
            {children}
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>

      </body>
    </html>
  )
}
