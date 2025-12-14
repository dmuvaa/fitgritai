"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FloatingAIChat } from "../components/floating-ai-chat"
import {
    ArrowLeft,
    Sparkles,
    MessageCircle,
    RefreshCw,
    TrendingUp,
    Target,
    Lightbulb,
    Calendar,
    Clock,
    Loader2,
    AlertCircle,
} from "lucide-react"
import Link from "next/link"

const WEEK_OPTIONS = [
    { value: 0, label: "This Week", short: "Now" },
    { value: 1, label: "1 Week Ago", short: "1W" },
    { value: 2, label: "2 Weeks Ago", short: "2W" },
    { value: 3, label: "3 Weeks Ago", short: "3W" },
]

interface CachedInsight {
    insights: string
    weeksAgo: number
    timestamp: string
}

interface InsightsCache {
    [key: number]: CachedInsight
}

export default function AICoachPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [selectedWeek, setSelectedWeek] = useState(0)
    const [insights, setInsights] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [cache, setCache] = useState<InsightsCache>({})

    useEffect(() => {
        loadUser()
        loadCacheFromStorage()
    }, [])

    useEffect(() => {
        const cached = cache[selectedWeek]
        if (cached) {
            setInsights(cached.insights)
            setLastUpdated(cached.timestamp)
            setError(null)
        } else {
            setInsights(null)
            setLastUpdated(null)
        }
    }, [selectedWeek, cache])

    const loadUser = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth")
                return
            }

            setUser(user)

            const { data: profileData } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .maybeSingle()

            if (!profileData) {
                router.push("/onboarding")
                return
            }

            setProfile(profileData)
        } catch (err) {
            console.error("Error loading user:", err)
        } finally {
            setPageLoading(false)
        }
    }

    const loadCacheFromStorage = () => {
        try {
            const stored = localStorage.getItem("fitgrit_insights_cache")
            if (stored) {
                const parsed = JSON.parse(stored)
                setCache(parsed)
                if (parsed[0]) {
                    setInsights(parsed[0].insights)
                    setLastUpdated(parsed[0].timestamp)
                }
            }
        } catch (e) {
            console.error("Error loading cache:", e)
        }
    }

    const saveCacheToStorage = (newCache: InsightsCache) => {
        try {
            localStorage.setItem("fitgrit_insights_cache", JSON.stringify(newCache))
        } catch (e) {
            console.error("Error saving cache:", e)
        }
    }

    const loadInsights = async (weeksAgo: number = selectedWeek) => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            const response = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    weeksAgo,
                }),
            })

            const data = await response.json()

            if (data.insights) {
                const newCacheEntry: CachedInsight = {
                    insights: data.insights,
                    weeksAgo: data.weeksAgo ?? weeksAgo,
                    timestamp: data.timestamp || new Date().toISOString(),
                }

                const newCache = { ...cache, [weeksAgo]: newCacheEntry }
                setCache(newCache)
                saveCacheToStorage(newCache)

                if (weeksAgo === selectedWeek) {
                    setInsights(data.insights)
                    setLastUpdated(newCacheEntry.timestamp)
                }
            } else {
                setError(data.error || "Failed to load insights")
            }
        } catch (err: any) {
            console.error("Error loading insights:", err)
            setError(err.message || "Failed to load insights")
        } finally {
            setLoading(false)
        }
    }

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return date.toLocaleDateString()
    }

    const parseInsightsToSections = (text: string) => {
        const sections: Array<{ title: string; content: string; icon: any }> = []
        const lines = text.split("\n").filter((line) => line.trim())
        let currentSection = { title: "Insights", content: "", icon: Lightbulb }

        lines.forEach((line) => {
            if (line.toLowerCase().includes("pattern") || line.toLowerCase().includes("trend")) {
                if (currentSection.content) sections.push(currentSection)
                currentSection = { title: "Patterns Noticed", content: "", icon: TrendingUp }
            } else if (line.toLowerCase().includes("doing well") || line.toLowerCase().includes("great job")) {
                if (currentSection.content) sections.push(currentSection)
                currentSection = { title: "What You're Doing Well", content: "", icon: Target }
            } else if (line.toLowerCase().includes("recommend") || line.toLowerCase().includes("suggest")) {
                if (currentSection.content) sections.push(currentSection)
                currentSection = { title: "Recommendations", content: "", icon: Lightbulb }
            } else {
                currentSection.content += (currentSection.content ? "\n" : "") + line
            }
        })

        if (currentSection.content) sections.push(currentSection)
        if (sections.length === 0) {
            return [{ title: "AI Analysis", content: text, icon: Sparkles }]
        }
        return sections
    }

    if (pageLoading) {
        return (
            <>
                <Navigation />
                <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-600">Loading AI Coach...</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">AI Coach</h1>
                                    <p className="text-gray-600">Your personal fitness advisor</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => loadInsights(selectedWeek)}
                                disabled={loading}
                                className="h-10 w-10"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Chat CTA */}
                    <Card className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <MessageCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Chat with AI Coach</h2>
                                        <p className="text-white/80">Ask questions & get personalized advice</p>
                                    </div>
                                </div>
                                <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                                    Start Chat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Week Selector */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-gray-700">Compare Progress</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {WEEK_OPTIONS.map((option) => {
                                const isSelected = selectedWeek === option.value
                                const hasCached = !!cache[option.value]
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedWeek(option.value)}
                                        className={`relative py-3 px-4 rounded-xl border text-center transition-all ${isSelected
                                                ? "border-orange-400 bg-orange-50"
                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                    >
                                        <p className={`text-sm font-semibold ${isSelected ? "text-orange-600" : "text-gray-700"}`}>
                                            {option.short}
                                        </p>
                                        <p className="text-xs text-gray-500">{option.label}</p>
                                        {hasCached && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    {selectedWeek === 0
                                        ? "This Week's Insights"
                                        : `${selectedWeek} Week${selectedWeek > 1 ? "s" : ""} Ago`}
                                </h2>
                            </div>
                            {lastUpdated && (
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimestamp(lastUpdated)}</span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-16 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Analyzing your progress...</p>
                                </CardContent>
                            </Card>
                        ) : error && !insights ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-12 text-center">
                                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-7 w-7 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Couldn't load insights</h3>
                                    <p className="text-gray-500 mb-4">{error}</p>
                                    <Button onClick={() => loadInsights(selectedWeek)}>Try Again</Button>
                                </CardContent>
                            </Card>
                        ) : insights ? (
                            <div className="grid gap-4">
                                {parseInsightsToSections(insights).map((section, index) => {
                                    const Icon = section.icon
                                    return (
                                        <Card key={index} className="border-0 shadow-lg">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-5 w-5 text-orange-500" />
                                                    <CardTitle className="text-lg">{section.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                    {section.content}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-12 text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {selectedWeek === 0
                                            ? "Get This Week's Analysis"
                                            : `Analyze ${selectedWeek} Week${selectedWeek > 1 ? "s" : ""} Ago`}
                                    </h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        Tap below to analyze your progress and get personalized recommendations.
                                    </p>
                                    <Button onClick={() => loadInsights(selectedWeek)} size="lg">
                                        Analyze Progress
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                            Quick Actions
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Card
                                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => setSelectedWeek((prev) => (prev + 1) % 4)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Compare Weeks</p>
                                            <p className="text-sm text-gray-500">See your progress over time</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {user && profile && <FloatingAIChat userId={user.id} profile={profile} />}
            <Footer />
        </>
    )
}
