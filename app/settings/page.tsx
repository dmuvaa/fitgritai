"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Bell, Sparkles, Mail, Info, Loader2, Check } from "lucide-react"
import Link from "next/link"

const REMINDER_INTERVALS = [
    { value: "24_hours", label: "24 Hours", description: "Daily reminders" },
    { value: "48_hours", label: "48 Hours", description: "Every other day" },
    { value: "3_days", label: "3 Days", description: "Twice a week" },
    { value: "1_week", label: "1 Week", description: "Weekly check-ins" },
    { value: "1_month", label: "1 Month", description: "Monthly summaries" },
]

const INSIGHTS_INTERVALS = [
    { value: "24_hours", label: "Daily", description: "Every day" },
    { value: "48_hours", label: "Every 2 Days", description: "Regular updates" },
    { value: "3_days", label: "Every 3 Days", description: "Mid-week analysis" },
    { value: "1_week", label: "Weekly", description: "Comprehensive weekly" },
    { value: "1_month", label: "Monthly", description: "Monthly deep-dive" },
]

interface Preferences {
    logging_reminder_intervals: string[]
    insights_delivery_intervals: string[]
    email_reminders: boolean
    weekly_reports: boolean
    achievements: boolean
    in_app_notifications: boolean
    marketing_emails: boolean
}

const defaultPreferences: Preferences = {
    logging_reminder_intervals: ["24_hours"],
    insights_delivery_intervals: ["1_week"],
    email_reminders: true,
    weekly_reports: true,
    achievements: true,
    in_app_notifications: true,
    marketing_emails: false,
}

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth")
                return
            }

            const response = await fetch("/api/emails/preferences")
            if (response.ok) {
                const data = await response.json()
                if (data.preferences) {
                    setPreferences({
                        ...defaultPreferences,
                        ...data.preferences,
                    })
                }
            }
        } catch (err) {
            console.error("Error loading preferences:", err)
            setError("Failed to load preferences")
        } finally {
            setLoading(false)
        }
    }

    const savePreferences = async () => {
        try {
            setSaving(true)
            setError(null)

            const response = await fetch("/api/emails/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences),
            })

            if (!response.ok) {
                throw new Error("Failed to save preferences")
            }

            setSaved(true)
            setHasChanges(false)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            setError(err.message || "Failed to save preferences")
        } finally {
            setSaving(false)
        }
    }

    const toggleReminderInterval = (value: string) => {
        const current = preferences.logging_reminder_intervals || []
        let updated: string[]

        if (current.includes(value)) {
            if (current.length > 1) {
                updated = current.filter((v) => v !== value)
            } else {
                return // Can't remove last selection
            }
        } else {
            if (current.length < 3) {
                updated = [...current, value]
            } else {
                return // Max 3 selections
            }
        }

        setPreferences({ ...preferences, logging_reminder_intervals: updated })
        setHasChanges(true)
    }

    const toggleInsightsInterval = (value: string) => {
        const current = preferences.insights_delivery_intervals || []
        let updated: string[]

        if (current.includes(value)) {
            if (current.length > 1) {
                updated = current.filter((v) => v !== value)
            } else {
                return
            }
        } else {
            if (current.length < 3) {
                updated = [...current, value]
            } else {
                return
            }
        }

        setPreferences({ ...preferences, insights_delivery_intervals: updated })
        setHasChanges(true)
    }

    const togglePreference = (key: keyof Preferences) => {
        setPreferences({ ...preferences, [key]: !preferences[key] })
        setHasChanges(true)
    }

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                                <p className="text-gray-600 mt-1">Manage your notification preferences</p>
                            </div>
                            <Button
                                onClick={savePreferences}
                                disabled={!hasChanges || saving}
                                className={saved ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : saved ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-red-700">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-6">
                        {/* Logging Reminders */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Logging Reminders</CardTitle>
                                        <CardDescription>Get reminded when you haven't logged. Select 1-3 intervals.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {REMINDER_INTERVALS.map((interval) => {
                                        const isSelected = preferences.logging_reminder_intervals?.includes(interval.value)
                                        return (
                                            <button
                                                key={interval.value}
                                                onClick={() => toggleReminderInterval(interval.value)}
                                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isSelected
                                                        ? "border-orange-400 bg-orange-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`font-medium ${isSelected ? "text-orange-700" : "text-gray-900"}`}>
                                                        {interval.label}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{interval.description}</p>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                                        }`}
                                                >
                                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Insights Delivery */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle>AI Insights Delivery</CardTitle>
                                        <CardDescription>How often should I analyze your progress? Select 1-3 intervals.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {INSIGHTS_INTERVALS.map((interval) => {
                                        const isSelected = preferences.insights_delivery_intervals?.includes(interval.value)
                                        return (
                                            <button
                                                key={interval.value}
                                                onClick={() => toggleInsightsInterval(interval.value)}
                                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isSelected
                                                        ? "border-purple-400 bg-purple-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`font-medium ${isSelected ? "text-purple-700" : "text-gray-900"}`}>
                                                        {interval.label}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{interval.description}</p>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-purple-500 bg-purple-500" : "border-gray-300"
                                                        }`}
                                                >
                                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notification Channels */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Notification Channels</CardTitle>
                                        <CardDescription>Choose how you want to receive notifications</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="font-medium text-gray-900">Email Reminders</p>
                                            <p className="text-sm text-gray-500">Receive logging reminders via email</p>
                                        </div>
                                        <Switch
                                            checked={preferences.email_reminders}
                                            onCheckedChange={() => togglePreference("email_reminders")}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t">
                                        <div>
                                            <p className="font-medium text-gray-900">Weekly Reports</p>
                                            <p className="text-sm text-gray-500">Get a weekly summary of your progress</p>
                                        </div>
                                        <Switch
                                            checked={preferences.weekly_reports}
                                            onCheckedChange={() => togglePreference("weekly_reports")}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t">
                                        <div>
                                            <p className="font-medium text-gray-900">Achievement Notifications</p>
                                            <p className="text-sm text-gray-500">Celebrate milestones and achievements</p>
                                        </div>
                                        <Switch
                                            checked={preferences.achievements}
                                            onCheckedChange={() => togglePreference("achievements")}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t">
                                        <div>
                                            <p className="font-medium text-gray-900">In-App Notifications</p>
                                            <p className="text-sm text-gray-500">Show notifications within the app</p>
                                        </div>
                                        <Switch
                                            checked={preferences.in_app_notifications}
                                            onCheckedChange={() => togglePreference("in_app_notifications")}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Marketing Preferences */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Marketing Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Product Updates & Tips</p>
                                        <p className="text-sm text-gray-500">Occasional emails about new features and fitness tips</p>
                                    </div>
                                    <Switch
                                        checked={preferences.marketing_emails}
                                        onCheckedChange={() => togglePreference("marketing_emails")}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Box */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-800">
                                            <strong>Smart Reminders:</strong> We'll only send reminders if you haven't logged within your
                                            selected intervals. No spam, just helpful nudges when you need them.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
