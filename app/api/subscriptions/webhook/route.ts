import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    switch (event.event) {
      case "subscription.create":
      case "subscription.enable":
        await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            paystack_subscription_code: event.data.subscription_code,
            updated_at: new Date().toISOString(),
          })
          .eq("paystack_customer_code", event.data.customer.customer_code)
        break

      case "subscription.disable":
        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("paystack_subscription_code", event.data.subscription_code)
        break

      case "invoice.payment_failed":
        await supabase
          .from("user_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("paystack_subscription_code", event.data.subscription.subscription_code)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
