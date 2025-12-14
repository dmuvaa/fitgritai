import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  console.log("\n🗑️ ========== DELETE ALL PLANS START ==========")

  try {
    const supabase = await createClient()

    // Step 1: Authenticate user
    console.log("🔐 Step 1: Authenticating user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed", details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error("❌ No user found")
      return NextResponse.json({ error: "Unauthorized - no user" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    // Step 2: Count plans BEFORE deletion
    console.log("\n📊 Step 2: Counting plans before deletion...")
    const { data: plansBefore, error: countBeforeError } = await supabase
      .from("personalized_plans")
      .select("*")
      .eq("user_id", user.id)

    if (countBeforeError) {
      console.error("❌ Error counting plans before:", countBeforeError)
    } else {
      console.log(`📊 Plans before deletion: ${plansBefore?.length || 0}`)
      if (plansBefore && plansBefore.length > 0) {
        console.log("📋 Plans to delete:")
        plansBefore.forEach((plan, index) => {
          console.log(`   ${index + 1}. ID: ${plan.id}, Type: ${plan.plan_type}, Week: ${plan.week_number}`)
        })
      } else {
        console.log("⚠️ No plans found to delete!")
      }
    }

    // Step 3: Perform DELETE operation
    console.log("\n🔥 Step 3: Executing DELETE query...")
    console.log(`   Query: DELETE FROM personalized_plans WHERE user_id = '${user.id}'`)

    const deleteResult = await supabase.from("personalized_plans").delete().eq("user_id", user.id).select() // This will return the deleted rows

    console.log("📤 Delete operation complete")
    console.log("   Error:", deleteResult.error ? deleteResult.error.message : "None")
    console.log("   Deleted rows:", deleteResult.data?.length || 0)

    if (deleteResult.error) {
      console.error("❌ DELETE query failed:", deleteResult.error)
      console.error("   Code:", deleteResult.error.code)
      console.error("   Message:", deleteResult.error.message)
      console.error("   Details:", deleteResult.error.details)
      console.error("   Hint:", deleteResult.error.hint)

      return NextResponse.json(
        {
          error: "Failed to delete plans",
          details: deleteResult.error.message,
          code: deleteResult.error.code,
        },
        { status: 400 },
      )
    }

    const deletedCount = deleteResult.data?.length || 0
    console.log(`✅ Successfully deleted ${deletedCount} plans`)

    // Step 4: Count plans AFTER deletion
    console.log("\n📊 Step 4: Counting plans after deletion...")
    const { data: plansAfter, error: countAfterError } = await supabase
      .from("personalized_plans")
      .select("*")
      .eq("user_id", user.id)

    if (countAfterError) {
      console.error("❌ Error counting plans after:", countAfterError)
    } else {
      console.log(`📊 Plans after deletion: ${plansAfter?.length || 0}`)
      if (plansAfter && plansAfter.length > 0) {
        console.warn("⚠️ WARNING: Plans still exist after deletion!")
        console.log("📋 Remaining plans:")
        plansAfter.forEach((plan, index) => {
          console.log(`   ${index + 1}. ID: ${plan.id}, Type: ${plan.plan_type}, Week: ${plan.week_number}`)
        })
      } else {
        console.log("✅ All plans successfully deleted!")
      }
    }

    // Step 5: Return summary
    const summary = {
      userId: user.id,
      plansBefore: plansBefore?.length || 0,
      plansDeleted: deletedCount,
      plansAfter: plansAfter?.length || 0,
    }

    console.log("\n📊 Final Summary:")
    console.log("   User ID:", summary.userId)
    console.log("   Plans Before:", summary.plansBefore)
    console.log("   Plans Deleted:", summary.plansDeleted)
    console.log("   Plans After:", summary.plansAfter)
    console.log("   Success:", summary.plansAfter === 0 && summary.plansBefore > 0)

    console.log("\n🗑️ ========== DELETE ALL PLANS END ==========\n")

    return NextResponse.json({
      success: true,
      message: "All plans deleted successfully",
      summary,
    })
  } catch (error: any) {
    console.error("\n❌ ========== DELETE ALL PLANS ERROR ==========")
    console.error("Error:", error)
    console.error("Message:", error.message)
    console.error("Stack:", error.stack)
    console.error("==============================================\n")

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
