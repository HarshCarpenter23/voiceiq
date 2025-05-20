"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, Upload, LogOut } from "lucide-react"
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
import { Avatar, } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"



export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [login, SetLogin] = useState(false)
  const routes = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Upload", icon: Upload, href: "/upload" },
    { title: "Reports", icon: FileText, href: "/reports" }
  ]
  useEffect(() => {
    console.log(pathname)
    if (pathname == "/login") {
      SetLogin(true)
    } else {
      SetLogin(false)
    }

  }, [pathname])
  if (login) {
    return null
  }
  const handleLogout = () => {
    document.cookie = "token=; max-age=0; path=/;"
    router.push("/login")
  }

  // if (status === "loading") {
  //   return (
  //     <Sidebar className="w-[250px]">
  //       <SidebarHeader className="border-b">
  //         <div className="flex h-14 items-center px-4">
  //           <div className="flex items-center gap-2 font-semibold">
  //             <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
  //             <span className="text-xl">VoiceIQ</span>
  //           </div>
  //         </div>
  //       </SidebarHeader>
  //       <SidebarContent>
  //         <div className="p-4 space-y-4">
  //           {[1, 2, 3, 4].map((i) => (
  //             <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
  //           ))}
  //         </div>
  //       </SidebarContent>
  //     </Sidebar>
  //   )
  // }

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
              {/* <AvatarImage src={imageUrl} alt="User" />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback> */}
            </Avatar>

            <div className="min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate">
                      {/* {truncateName(userName)} */}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {/* <p>{userName}</p> */}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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