"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval_type: string
  paystack_plan_code: string
  features: string[]
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }
      setUser(user)
    }

    const getPlans = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })

      if (error) {
        console.error("Error fetching plans:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive",
        })
        return
      }

      if (data) {
        setPlans(
          data.map((plan) => ({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features : [],
          })),
        )
      }
    }

    getUser()
    getPlans()
  }, [router, toast])

  const handleSubscribe = async (plan: Plan) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Please try logging in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setLoadingPlanId(plan.id)

    try {
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_type: plan.name,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      } else {
        throw new Error("No authorization URL received")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingPlanId(null)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Check className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "pro":
        return <Zap className="h-6 w-6" />
      default:
        return <Check className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return "from-blue-500 to-blue-600"
      case "premium":
        return "from-orange-500 to-orange-600"
      case "pro":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen gradient-brand">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="gradient-text">FitGrit Plan</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock the full power of your AI weight loss coach. No contracts, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300 ${
                  plan.name.toLowerCase() === "premium" ? "ring-2 ring-orange-500 scale-105" : ""
                }`}
              >
                {plan.name.toLowerCase() === "premium" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${getPlanColor(plan.name)} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <div className="text-white">{getPlanIcon(plan.name)}</div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₦{plan.price.toLocaleString()}</span>
                    <span className="text-gray-500">/{plan.interval_type}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading}
                    className={`w-full rounded-xl py-3 bg-gradient-to-r ${getPlanColor(plan.name)} hover:shadow-lg transition-all duration-300 disabled:opacity-50`}
                  >
                    {loadingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline">30-day money-back guarantee</Badge>
              <Badge variant="outline">Cancel anytime</Badge>
              <Badge variant="outline">Secure payments via Paystack</Badge>
              <Badge variant="outline">24/7 support</Badge>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
