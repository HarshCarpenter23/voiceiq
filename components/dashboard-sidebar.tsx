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
import { getCookie } from "@/lib/cookies"

// Helper function to extract country code
function getCountryCode(claimant) {
  const match = claimant?.match(/Country Code: ([A-Z]{2})/)
  return match ? match[1].toLowerCase() : "us"
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mauthNUser, setMauthNUser] = useState(null)

  // Check for MauthN data from cookies on mount
  useEffect(() => {
    const checkMauthNData = () => {
      // Using cookie instead of localStorage
      const mauthNDataStr = getCookie("mauthNUserData")
      if (mauthNDataStr) {
        try {
          const userData = JSON.parse(decodeURIComponent(mauthNDataStr))
          setMauthNUser(userData)
        } catch (e) {
          console.error("Failed to parse MauthN cookie data:", e)
        }
      }
    }

    // Check on mount and when session changes
    checkMauthNData()
  }, [session])

  const routes = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Upload", icon: Upload, href: "/upload" },
    { title: "Reports", icon: FileText, href: "/reports" },
    { title: "Analytics", icon: BarChart, href: "http://104.225.221.108:3000/" },
  ]

  const handleLogout = () => {
    // Clear MauthN cookie (will need to be handled by your cookies lib)
    document.cookie = "mauthNUserData=; max-age=0; path=/;"
    signOut({ callbackUrl: "/login" })
  }

  // Helper function for user initials
  const getInitials = (name) => {
    if (!name) return "??"
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
  }

  const truncateName = (name, maxLength = 20) => {
    if (!name) return "User"
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
  }

  // Determine the user's authentication state
  // First check if user is authenticated via NextAuth session
  const isSessionActive = status === "authenticated" && !!session?.user
  
  // Check if session has MauthN data or if we have standalone MauthN data
  const hasMauthNData = !!(session?.user?.mauthNData || mauthNUser)

  // Determine display name - prioritize session data
  const userName = session?.user?.name || (mauthNUser?.name || "Guest")
  const userEmail = session?.user?.email || (mauthNUser?.email || "")
  
  // Get claimant information for displaying MauthN verification
  const claimant = session?.user?.mauthNData?.claimant || mauthNUser?.claimant
  
  // Determine country code for flag
  const countryCode = claimant ? getCountryCode(claimant) : "us"

  // Image source - use MauthN country flag or session image
  const imageUrl = hasMauthNData 
    ? `https://flagcdn.com/w80/${countryCode}.png`
    : session?.user?.image || ""

  if (status === "loading") {
    return (
      <Sidebar className="w-[250px]">
        <SidebarHeader className="border-b">
          <div className="flex h-14 items-center px-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              <span className="text-xl">VoiceIQ</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

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
              <AvatarImage src={imageUrl} alt="User" />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
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
              
              {hasMauthNData ? (
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
                        <p className="text-xs">{claimant}</p>
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