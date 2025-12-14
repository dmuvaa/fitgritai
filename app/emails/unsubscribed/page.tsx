"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function UnsubscribedContent() {
  const searchParams = useSearchParams()
  const type = searchParams?.get("type")

  const getTypeMessage = () => {
    switch (type) {
      case "daily_reminder":
        return "daily reminder emails"
      case "weekly_progress":
        return "weekly progress emails"
      case "achievement":
        return "achievement emails"
      default:
        return "all marketing emails"
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl">You've Been Unsubscribed</CardTitle>
        <CardDescription>We've updated your email preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-700">
          You will no longer receive <strong>{getTypeMessage()}</strong>.
        </p>

        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Changed your mind?</strong>
            <br />
            You can update your email preferences anytime from your dashboard settings.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Manage Email Preferences</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 pt-4">
          We're sorry to see you go. If you have feedback on how we can improve our emails, please{" "}
          <a href="mailto:dennis@fitgritai.com" className="text-violet-600 hover:underline">
            let us know
          </a>
          .
        </p>
      </CardContent>
    </Card>
  )
}

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <UnsubscribedContent />
      </Suspense>
    </div>
  )
}

