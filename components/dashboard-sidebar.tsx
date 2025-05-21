"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, Upload, LogOut, Settings, Headphones, BarChart2 } from "lucide-react"
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
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [login, setLogin] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("john@example.com")
  const [imageUrl, setImageUrl] = useState("")
  
  const mainRoutes = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Reports", icon: FileText, href: "/reports" },
    { title: "Analytics", icon: BarChart2, href: "/analytics" },
    { title: "Upload", icon: Upload, href: "/upload" }
  ]
  
  const utilityRoutes = [
    { title: "Settings", icon: Settings, href: "/settings" }
  ]
  
  useEffect(() => {
    if (pathname === "/login") {
      setLogin(true)
    } else {
      setLogin(false)
    }
    
    // You could fetch user info here in a real app
    // const fetchUserInfo = async () => {
    //   try {
    //     const response = await fetch('/api/user');
    //     const data = await response.json();
    //     setUserName(data.name);
    //     setUserEmail(data.email);
    //     setImageUrl(data.imageUrl);
    //   } catch (error) {
    //     console.error('Failed to fetch user info:', error);
    //   }
    // };
    // fetchUserInfo();
    
  }, [pathname])
  
  if (login) {
    return null
  }
  
  const handleLogout = () => {
    document.cookie = "token=; max-age=0; path=/;"
    router.push("/login")
  }
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  const truncateName = (name) => {
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  }

  return (
    <Sidebar className="w-[240px] bg-background border-r border-border">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex h-16 items-center px-5">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="text-lg tracking-tight">VoiceIQ</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground/70 px-2 py-1.5">MAIN</p>
          <SidebarMenu>
            {mainRoutes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === route.href 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Link href={route.href} className="flex items-center gap-3 w-full">
                    <route.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{route.title}</span>
                    
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <Separator className="my-4 opacity-50" />
          
          {/* <p className="text-xs font-medium text-muted-foreground/70 px-2 py-1.5">UTILITIES</p>
          <SidebarMenu>
            {utilityRoutes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === route.href 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Link href={route.href} className="flex items-center gap-3 w-full">
                    <route.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu> */}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={imageUrl} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{getInitials(userName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate">
                      {truncateName(userName)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{userName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
            
            <ModeToggle />
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full justify-start text-sm font-normal border-border/60"
          >
            <LogOut className="h-4 w-4 mr-2 opacity-70" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
      <SidebarTrigger />
    </Sidebar>
  )
}