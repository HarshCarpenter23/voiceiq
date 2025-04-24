// app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ClientOnly } from "@/components/client-only"
import ClientLayout from "@/components/client-layout"
import { SessionProviderWrapper } from "@/components/session-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audio Analysis Dashboard",
  description: "Upload audio files and view generated reports",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <SessionProviderWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <SidebarProvider>
                <ClientLayout>{children}</ClientLayout>
                <Toaster />
              </SidebarProvider>
            </ThemeProvider>
          </SessionProviderWrapper>
        </ClientOnly>
      </body>
    </html>
  )
}
