"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { setCookie } from "@/lib/cookies"

interface MauthNModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (userData: MauthNUserData) => void
}

export interface MauthNUserData {
  name: string
  claimant: string
  email: string
}

export function MauthNModal({ isOpen, onClose, onSuccess }: MauthNModalProps) {
  const [email, setEmail] = useState("")
  const [requestId, setRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "submitting" | "polling">("idle")
  const router = useRouter()
  
  const isPollingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!email || !email.includes("@")) {
    toast.error("Please enter a valid email address")
    return
  }

  setLoading(true)
  setStatus("submitting")

  try {
    const formData = new FormData()
    formData.append("email", email.trim().toLowerCase())
    formData.append("data", "1000")
    formData.append("requester", "MetaKey")

    const response = await fetch("https://mauthn.mukham.in/add_request", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
    }

    const id = await response.text()
    setRequestId(id.trim())
    setStatus("polling")
    toast.info("Verification initiated. Please complete authentication in the MauthN app.")
    startPolling(id.trim())
  } catch (error) {
    console.error("MauthN request error:", error)
    toast.error(error instanceof Error ? error.message : "Failed to connect to MauthN service")
    setLoading(false)
    setStatus("idle")
  }
}

  const startPolling = (token: string) => {
    stopPolling()
    isPollingRef.current = true
    
    // Set timeout for 2 minutes
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setStatus("idle")
      setLoading(false)
      toast.error("Authentication timed out. Please try again.")
    }, 2 * 60 * 1000)

    const pollStatus = async () => {
        if (!isPollingRef.current) return;
        
        try {
          const formData = new FormData();
          formData.append("token", token);
      
          const response = await fetch("https://mauthn.mukham.in/get_data", {
            method: "POST",
            body: formData,
          });
      
          if (response.ok) {
            const data = await response.text();
            console.log("MauthN status response:", data);
      
            // If we get a response with json array format, that's our successful data
            if (data.trim().startsWith("[{") && data.trim().endsWith("}]")) {
              // Stop polling immediately
              stopPolling();
              
              try {
                const userData = JSON.parse(data);
                
                if (Array.isArray(userData) && userData.length > 0) {
                    const user = userData[0];
                    localStorage.setItem("mauthNUserData", JSON.stringify(user));
                    
                    // Force a full page reload to ensure auth state is updated
                    window.location.href = "/";
                    return;
                  }
              } catch (parseError) {
                console.error("Failed to parse MauthN response:", parseError, "Raw data:", data);
                toast.error("Authentication failed - invalid data format");
                setStatus("idle");
                setLoading(false);
                return;
              }
            }
      
            // Handle expired session
            if (data.toLowerCase().includes("expired")) {
              stopPolling();
              toast.error("Session expired. Please try again.");
              setStatus("idle");
              setLoading(false);
              return;
            }
      
            // If it's still pending, we'll poll again on the next interval
            if (data.includes("pending")) {
              // Continue polling
              return;
            }
            
            // If we got here, we received a response we don't recognize
            console.warn("Unrecognized MauthN response:", data);
          } else {
            const errorText = await response.text();
            console.error("Failed to get MauthN status:", response.status, errorText);
          }
        } catch (error) {
          console.error("MauthN polling error:", error);
          stopPolling();
          setStatus("idle");
          setLoading(false);
          toast.error("Authentication process failed. Please try again.");
        }
      }
    
    pollStatus()
    intervalRef.current = setInterval(pollStatus, 5000)
  }
  
  const stopPolling = () => {
    isPollingRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopPolling()
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authenticate with MauthN</DialogTitle>
          <DialogDescription>
            Enter your MauthN registered email to authenticate.
          </DialogDescription>
        </DialogHeader>
        
        {status === "idle" || status === "submitting" ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="mauthn-email">Email</Label>
              <Input
                id="mauthn-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                disabled={loading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                "Authenticate"
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center">
              Authentication in progress.<br />
              Please complete the verification in your MauthN app.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                stopPolling()
                setStatus("idle")
                setLoading(false)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}