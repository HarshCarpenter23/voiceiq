"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Home, Settings, Upload, LogOut, Shield } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MauthNUserData {
  name: string
  claimant: string
  email: string
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mauthNUser, setMauthNUser] = useState<MauthNUserData | null>(null)

  // Check auth status on mount and session changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const mauthNData = localStorage.getItem("mauthNUserData")
      if (mauthNData) {
        try {
          setMauthNUser(JSON.parse(mauthNData))
        } catch (e) {
          console.error("Failed to parse MauthN data:", e)
        }
      }
    }
    checkAuthStatus()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mauthNUserData") checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [session])

  const routes = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Upload", icon: Upload, href: "/upload" },
    { title: "Reports", icon: FileText, href: "/reports" },
    { title: "Analytics", icon: BarChart, href: "http://104.225.221.108:3000/" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("mauthNUserData")
    if (session) {
      signOut({ callbackUrl: "/login" })
    } else {
      window.location.href = "/login"
    }
  }

  // Helper functions
  const extractCountry = (claimant: string): string => {
    const match = claimant.match(/Country Code: ([A-Z]{2})/)
    return match ? match[1] : "US"
  }

  const getInitials = (name?: string): string => {
    if (!name) return "??"
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
  }

  const truncateName = (name: string, maxLength = 20): string => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
  }

  // Determine auth state
  const isMauthNLoggedIn = !!mauthNUser
  const isSessionLoggedIn = !!session?.user
  const userName = isMauthNLoggedIn ? mauthNUser.name : session?.user?.name || "Guest"
  const userEmail = isMauthNLoggedIn ? mauthNUser.email : session?.user?.email

  return (
    <Sidebar className="w-[250px]">
      <SidebarHeader className="border-b">
        <div className="flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg className="h-6 w-6" /* your logo SVG */ />
            <span className="text-xl">VoiceIQ</span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href}>
                <Link href={route.href} className="flex items-center gap-2">
                  <route.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between p-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {isMauthNLoggedIn ? (
                <>
                  <AvatarImage
                    src={`https://flagcdn.com/w80/${extractCountry(mauthNUser.claimant).toLowerCase()}.png`}
                    alt="Country Flag"
                  />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={session?.user?.image || ""} alt="User" />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </>
              )}
            </Avatar>
            
            <div className="min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate">
                      {truncateName(userName)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{userName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {isMauthNLoggedIn ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">MauthN Verified</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{userEmail}</p>
                        <p className="text-xs">{mauthNUser.claimant}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail || "Logged In"}
                </p>
              )}
            </div>
          </div>
          
          <ModeToggle />
        </div>
        
        <div className="p-4 pt-0">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
      
      <SidebarTrigger />
    </Sidebar>
  )
}