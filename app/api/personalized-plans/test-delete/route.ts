import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  console.log("\n🧪 ========== RLS POLICY TEST START ==========")

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    const results: any = {
      userId: user.id,
      tests: {},
    }

    // Test 1: SELECT
    console.log("\n📖 Test 1: SELECT permission")
    const selectTest = await supabase.from("personalized_plans").select("*").eq("user_id", user.id)

    results.tests.select = {
      success: !selectTest.error,
      rowCount: selectTest.data?.length || 0,
      error: selectTest.error?.message || null,
    }
    console.log("   Result:", results.tests.select.success ? "✅ PASS" : "❌ FAIL")
    if (selectTest.error) {
      console.log("   Error:", selectTest.error.message)
    } else {
      console.log("   Rows found:", selectTest.data?.length || 0)
    }

    // Test 2: INSERT
    console.log("\n📝 Test 2: INSERT permission")
    const testPlan = {
      user_id: user.id,
      plan_type: "workout",
      week_number: 999,
      plan_data: { test: true },
      is_active: false,
    }

    const insertTest = await supabase.from("personalized_plans").insert(testPlan).select().single()

    results.tests.insert = {
      success: !insertTest.error,
      insertedId: insertTest.data?.id || null,
      error: insertTest.error?.message || null,
    }
    console.log("   Result:", results.tests.insert.success ? "✅ PASS" : "❌ FAIL")
    if (insertTest.error) {
      console.log("   Error:", insertTest.error.message)
    } else {
      console.log("   Inserted ID:", insertTest.data?.id)
    }

    // Test 3: DELETE (of the test record)
    if (insertTest.data?.id) {
      console.log("\n🗑️ Test 3: DELETE permission")
      const deleteTest = await supabase.from("personalized_plans").delete().eq("id", insertTest.data.id).select()

      results.tests.delete = {
        success: !deleteTest.error,
        deletedCount: deleteTest.data?.length || 0,
        error: deleteTest.error?.message || null,
      }
      console.log("   Result:", results.tests.delete.success ? "✅ PASS" : "❌ FAIL")
      if (deleteTest.error) {
        console.log("   Error:", deleteTest.error.message)
      } else {
        console.log("   Deleted rows:", deleteTest.data?.length || 0)
      }
    }

    // Summary
    const allPassed = Object.values(results.tests).every((test: any) => test.success)
    results.summary = {
      allTestsPassed: allPassed,
      passedCount: Object.values(results.tests).filter((test: any) => test.success).length,
      totalTests: Object.keys(results.tests).length,
    }

    console.log("\n📊 Test Summary:")
    console.log("   All Tests Passed:", allPassed ? "✅ YES" : "❌ NO")
    console.log("   Passed:", results.summary.passedCount, "/", results.summary.totalTests)
    console.log("\n🧪 ========== RLS POLICY TEST END ==========\n")

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("\n❌ Test error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
