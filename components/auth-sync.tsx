"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AuthSync() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Check for MauthN authentication
    const mauthNData = localStorage.getItem("mauthNUserData")
    const isMauthNAuthenticated = !!mauthNData

    // If authenticated via MauthN but no session exists
    if (isMauthNAuthenticated && status === "unauthenticated") {
      // Force a full page reload to sync auth state
      window.location.href = "/"
    }
  }, [status, router])

  return null
}