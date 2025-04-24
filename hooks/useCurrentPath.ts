"use client"

import { usePathname } from "next/navigation"

export function useCurrentPath() {
  const pathname = usePathname()
  return pathname
}
