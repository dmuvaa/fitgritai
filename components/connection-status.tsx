"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, Wifi } from "lucide-react"

interface ConnectionStatus {
  success: boolean
  error?: string
  type: "credentials" | "connection" | "tables" | "complete"
  missingTables?: string[]
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      // Call API route instead of direct server function
      const response = await fetch("/api/health-check")
      const result = await response.json()

      if (result.database) {
        setStatus({
          success: true,
          type: "complete",
        })
      } else {
        setStatus({
          success: false,
          error: result.error || "Database connection failed",
          type: "connection",
        })
      }
    } catch (error) {
      console.error("Connection check failed:", error)
      setStatus({
        success: false,
        error: "Failed to test connection",
        type: "connection",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-500" />
    if (status.success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Checking...</Badge>
    if (!status) return <Badge variant="secondary">Unknown</Badge>
    if (status.success) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>

    switch (status.type) {
      case "credentials":
        return <Badge variant="destructive">Not Configured</Badge>
      case "connection":
        return <Badge variant="destructive">Connection Failed</Badge>
      case "tables":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Setup Required</Badge>
      default:
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const getStatusMessage = () => {
    if (isLoading) return "Testing database connection..."
    if (!status) return "Click refresh to test connection"
    if (status.success) return "Database is properly configured and all tables are accessible."

    switch (status.type) {
      case "credentials":
        return "Supabase environment variables are not configured. Please set up your .env.local file."
      case "connection":
        return "Cannot connect to Supabase. Please check your credentials and network connection."
      case "tables":
        return `Database connected but missing tables: ${status.missingTables?.join(", ")}. Please run the setup scripts.`
      default:
        return status.error || "Unknown error occurred"
    }
  }

  const getRecommendedAction = () => {
    if (!status || status.success) return null

    switch (status.type) {
      case "credentials":
        return (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create a Supabase project at supabase.com</li>
              <li>Copy your project URL and anon key</li>
              <li>Add them to your .env.local file</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )
      case "tables":
        return (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Database Setup Required:</h4>
            <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Run the setup scripts from the /scripts folder</li>
              <li>Refresh this page to verify</li>
            </ol>
          </div>
        )
      case "connection":
        return (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Connection Issues:</h4>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Verify your Supabase URL and API key</li>
              <li>Check your internet connection</li>
              <li>Ensure your Supabase project is active</li>
            </ul>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Database Connection</CardTitle>
              <CardDescription>Supabase configuration and table status</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{getStatusMessage()}</p>

        {/* Connection Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Environment</span>
            <Badge variant="outline" className="ml-auto">
              {process.env.NODE_ENV || "development"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Database</span>
            <Badge variant="outline" className="ml-auto">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Status</span>
            <Badge variant="outline" className="ml-auto">
              {status?.success ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {getRecommendedAction()}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
