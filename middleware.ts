// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const isLoginPage = req.nextUrl.pathname.startsWith("/login")

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

// Apply to all routes except static files and API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
