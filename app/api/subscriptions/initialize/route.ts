import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan_type, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("name", plan_type)
      .eq("is_active", true)
      .single()

    if (planError || !plan) {
      console.error("Plan fetch error:", planError)
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Generate unique reference
    const reference = `fitgrit_${user.id.substring(0, 8)}_${Date.now()}`

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("subscription_transactions")
      .insert({
        user_id: user.id,
        reference,
        amount: plan.price,
        currency: plan.currency,
        plan_type: plan.name,
        status: "pending",
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Transaction creation error:", transactionError)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Check if Paystack secret key is configured
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 })
    }

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: plan.price * 100, // Paystack expects amount in kobo (smallest currency unit)
        reference,
        currency: plan.currency,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/verify`,
        metadata: {
          user_id: user.id,
          plan_type: plan.name,
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan.name,
            },
          ],
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error("Paystack initialization error:", paystackData)
      return NextResponse.json({ error: paystackData.message || "Payment initialization failed" }, { status: 500 })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      access_code: paystackData.data.access_code,
    })
  } catch (error) {
    console.error("Subscription initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
