"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VerifySubscription() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus("error")
        setMessage("No payment reference found")
        return
      }

      try {
        const response = await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus("success")
          setMessage("Your subscription has been activated successfully!")

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Payment verification failed")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("An error occurred while verifying your payment")
      }
    }

    verifyPayment()
  }, [reference, router])

  return (
    <div className="min-h-screen flex items-center justify-center gradient-brand p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-blue-500" />}
            {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-base mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <p className="text-sm text-gray-600 mb-4">Redirecting to dashboard in 3 seconds...</p>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you were charged, please contact support with reference: <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{reference}</code>
              </p>
              <Button onClick={() => router.push("/subscription")} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
