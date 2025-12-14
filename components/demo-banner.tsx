"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"
import { isSupabaseConfigured } from "@/lib/supabase-client-utils"

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
  }, [])

  if (!isVisible) return null

  return (
    <Alert
      className={`border-0 rounded-none ${isConfigured ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={`${isConfigured ? "text-green-800" : "text-orange-800"} font-medium`}>
            {isConfigured ? (
              "Database connected successfully! All features are available."
            ) : (
              <>
                Demo Mode: Database not configured.{" "}
                <Link href="/setup" className="underline hover:no-underline">
                  Set up your database
                </Link>{" "}
                to enable full functionality.
              </>
            )}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          {!isConfigured && (
            <Button variant="outline" size="sm" asChild className="bg-white/80 hover:bg-white">
              <Link href="/setup">
                <Settings className="h-3 w-3 mr-1" />
                Setup
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 hover:bg-white/50"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
