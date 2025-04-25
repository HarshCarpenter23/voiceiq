"use client"

import Image from 'next/image';
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import MAuthNImg from "@/public/images/mauthn.png"
import { MauthNModal, MauthNUserData } from "@/components/mauthn-modal"
import { getCookie } from "@/lib/cookies"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isMauthNModalOpen, setIsMauthNModalOpen] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()

    // Redirect if already logged in
    useEffect(() => {
        if (session) {
            router.push("/")
        }
    }, [session, router])

    // Check for MauthN data in cookies on component mount
    useEffect(() => {
        const checkMauthNAuth = async () => {
            const mauthNUserDataStr = getCookie("mauthNUserData");
            if (mauthNUserDataStr) {
                try {
                    const userData = JSON.parse(decodeURIComponent(mauthNUserDataStr));
                    if (userData?.email) {
                        // Try to sign in with MauthN data
                        const result = await signIn("mauthn", {
                            redirect: false,
                            email: userData.email,
                            userData: JSON.stringify(userData)
                        });

                        if (result?.error) {
                            console.error("MauthN sign-in error:", result.error);
                        } else {
                            router.push("/");
                        }
                    }
                } catch (err) {
                    console.error("Error parsing MauthN cookie data:", err);
                }
            }
        };

        if (status !== "loading" && !session) {
            checkMauthNAuth();
        }
    }, [status, session, router]);

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                setError(result.error)
                setIsLoading(false)
            } else {
                router.push("/")
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
            setIsLoading(false)
        }
    }

    const handleMauthNLogin = async (e) => {
        e.preventDefault()
        setError("")
        // Open the MauthN modal dialog
        setIsMauthNModalOpen(true)
    }

    const handleMauthNSuccess = async (userData: MauthNUserData) => {
        // Sign in with MauthN provider
        try {
            const result = await signIn("mauthn", {
                redirect: false,
                email: userData.email,
                userData: JSON.stringify(userData)
            });

            if (result?.error) {
                setError(result.error);
                setIsMauthNModalOpen(false);
            } else {
                // Close modal and redirect
                setIsMauthNModalOpen(false);
                router.push("/");
            }
        } catch (err) {
            console.error("Error during MauthN sign-in:", err);
            setError("Failed to authenticate with MauthN");
            setIsMauthNModalOpen(false);
        }
    }

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading your account...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-6 shadow-xl rounded-2xl overflow-hidden">
                {/* Left: Brand Section */}
                <div className="hidden lg:flex lg:col-span-2 bg-primary flex-col justify-between text-primary-foreground p-8">
                    {/* Brand content remains the same */}
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Voice IQ</h1>
                        <p className="text-primary-foreground/80">Speech-2-Text</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-medium">Why users love us:</h3>
                            <ul className="text-sm space-y-1">
                                <li>• Seamless collaboration</li>
                                <li>• Powerful analytics</li>
                                <li>• Real Time Speech to Text</li>
                                <li>• 24/7 customer support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-xs text-primary-foreground/70">
                        © 2025 VoiceIQ. All rights reserved.
                    </div>
                </div>

                {/* Right: Login Section */}
                <Card className="lg:col-span-3 border-0 shadow-none">
                    <div className="px-8 py-12">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                            <CardDescription>Sign in to your account to continue</CardDescription>
                        </CardHeader>

                        <CardContent className="px-0 py-4">
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-muted-foreground">
                                            <MailIcon size={16} />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password field */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="/forgot-password" className="text-xs text-primary hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-muted-foreground">
                                            <LockIcon size={16} />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => signIn("google", { callbackUrl: "/" })}
                                    className="w-full"
                                >
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleMauthNLogin}
                                    className="w-full"
                                >
                                    <Image
                                        src={MAuthNImg}
                                        alt="MauthN"
                                        width={22}
                                        height={22}
                                        className="mr-1"
                                    />
                                    MauthN
                                </Button>
                            </div>
                        </CardContent>

                        <CardFooter className="px-0 pt-6 pb-0 flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <a href="/signup" className="text-primary font-medium hover:underline">
                                    Sign up
                                </a>
                            </p>
                        </CardFooter>
                    </div>
                </Card>
            </div>

            {/* MauthN Modal */}
            <MauthNModal 
                isOpen={isMauthNModalOpen}
                onClose={() => setIsMauthNModalOpen(false)}
                onSuccess={handleMauthNSuccess}
            />
        </div>
    )
}