'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    // Call your API to authenticate
    console.log("Traditional login: ", email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left: Traditional Login */}
        <div className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full">Login</Button>
          </CardContent>
        </div>

        {/* Right: Google OAuth Login */}
        <div className="bg-muted flex flex-col justify-center items-center p-8">
          <h2 className="text-xl font-semibold mb-4">Or continue with</h2>
          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
