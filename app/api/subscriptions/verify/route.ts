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

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error("Paystack verification error:", paystackData)
      return NextResponse.json({ error: paystackData.message || "Payment verification failed" }, { status: 400 })
    }

    if (paystackData.data.status !== "success") {
      return NextResponse.json({ error: `Payment status: ${paystackData.data.status}` }, { status: 400 })
    }

    // Update transaction status
    const { error: transactionError } = await supabase
      .from("subscription_transactions")
      .update({
        status: "completed",
        paystack_reference: paystackData.data.reference,
        verified_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .eq("user_id", user.id)

    if (transactionError) {
      console.error("Transaction update error:", transactionError)
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }

    // Create or update user subscription
    const planType = paystackData.data.metadata.plan_type
    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date()

    // Set subscription period based on plan interval
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // Default 1 month

    const { error: subscriptionError } = await supabase.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        plan_type: planType,
        status: "active",
        paystack_customer_code: paystackData.data.customer?.customer_code,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      plan: planType,
    })
  } catch (error) {
    console.error("Subscription verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
