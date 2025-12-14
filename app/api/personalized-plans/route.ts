// import { type NextRequest, NextResponse } from "next/server"
// import { getSupabaseForRequest } from "@/utils/supabase/api-request"

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   console.log("[API] GET /api/personalized-plans - Request started");
  
//   try {
//     const supabase = await getSupabaseForRequest(request)
//     console.log("[API] Supabase client created successfully");

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()

//     if (authError || !user) {
//       console.error("[API] Authentication failed:", {
//         hasUser: !!user,
//         authError: authError?.message,
//       });
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     console.log("[API] User authenticated:", {
//       userId: user.id,
//       email: user.email,
//     });

//     const { searchParams } = new URL(request.url)
//     const planType = searchParams.get("type") // 'workout' or 'meal'
//     const week = searchParams.get("week")
//     const date = searchParams.get("date") // New: query by specific date (YYYY-MM-DD)
//     const startDate = searchParams.get("startDate") // New: query by date range start
//     const endDate = searchParams.get("endDate") // New: query by date range end

//     console.log("[API] Query parameters:", {
//       planType: planType || "all",
//       week: week || "all",
//       date: date || "none",
//       dateRange: startDate && endDate ? `${startDate} to ${endDate}` : "none",
//       url: request.url,
//     });

//     let query = supabase.from("personalized_plans").select("*").eq("user_id", user.id).eq("is_active", true)

//     if (planType) {
//       query = query.eq("plan_type", planType)
//       console.log("[API] Filtering by plan_type:", planType);
//     }

//     // Support date-based queries (new day-by-day storage)
//     if (date) {
//       query = query.eq("date", date)
//       console.log("[API] Filtering by date:", date);
//     } else if (startDate && endDate) {
//       query = query.gte("date", startDate).lte("date", endDate)
//       console.log("[API] Filtering by date range:", startDate, "to", endDate);
//     }

//     // Support week-based queries (backward compatibility)
//     if (week && !date && !startDate) {
//       const weekNum = Number.parseInt(week)
//       query = query.eq("week_number", weekNum)
//       console.log("[API] Filtering by week_number:", weekNum);
//     }

//     // Order by date if available, otherwise by week_number (backward compatibility)
//     if (date || startDate) {
//       query = query.order("date", { ascending: true })
//     } else {
//       query = query.order("week_number", { ascending: true })
//     }

//     console.log("[API] Executing database query...");
//     const { data, error } = await query
//     const queryTime = Date.now() - startTime;

//     if (error) {
//       console.error("[API] Database query error:", {
//         error: error.message,
//         code: error.code,
//         details: error.details,
//         hint: error.hint,
//         queryTime: `${queryTime}ms`,
//       });
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     console.log("[API] Database query successful:", {
//       plansFound: data?.length || 0,
//       queryTime: `${queryTime}ms`,
//     });

//     // Filter plans from current day onwards based on week boundaries
//     const now = new Date()
//     const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
//     // Calculate which week we're in (Week 1 = current week starting today, ends Sunday)
//     const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay
//     const week1End = new Date(today)
//     week1End.setDate(week1End.getDate() + daysUntilSunday)

//     console.log("[API] Starting date filtering:", {
//       currentDate: today.toISOString().split('T')[0],
//       currentDayOfWeek: currentDay,
//       daysUntilSunday,
//       week1End: week1End.toISOString().split('T')[0],
//       plansBeforeFilter: data?.length || 0,
//     });

//     let filteredCount = 0;
//     let skippedPastWorkouts = 0;
//     let skippedPastMeals = 0;
//     let keptByWeekNumber = 0;

//     const filtered = (data || []).filter((plan: any) => {
//       // If plan has content with workouts/meals, check dates
//       if (plan.content) {
//         if (plan.content.workouts && Array.isArray(plan.content.workouts)) {
//           // Check if any workout date is today or future
//           const hasValidWorkout = plan.content.workouts.some((w: any) => {
//             if (w.date) {
//               const workoutDate = new Date(w.date)
//               const isValid = workoutDate >= today
//               if (!isValid) skippedPastWorkouts++;
//               return isValid
//             }
//             // If no date, include if week number is current or future
//             keptByWeekNumber++;
//             return plan.week_number >= 1
//           })
//           if (hasValidWorkout) filteredCount++;
//           return hasValidWorkout
//         }
//         if (plan.content.dailyPlan && Array.isArray(plan.content.dailyPlan)) {
//           // Check if any meal day date is today or future
//           const hasValidMeal = plan.content.dailyPlan.some((d: any) => {
//             if (d.date) {
//               const mealDate = new Date(d.date)
//               const isValid = mealDate >= today
//               if (!isValid) skippedPastMeals++;
//               return isValid
//             }
//             keptByWeekNumber++;
//             return plan.week_number >= 1
//           })
//           if (hasValidMeal) filteredCount++;
//           return hasValidMeal
//         }
//       }
//       // Include if week number is current or future (default)
//       keptByWeekNumber++;
//       filteredCount++;
//       return plan.week_number >= 1
//     })

//     const totalTime = Date.now() - startTime;
//     console.log("[API] Date filtering completed:", {
//       plansBeforeFilter: data?.length || 0,
//       plansAfterFilter: filtered?.length || 0,
//       filteredCount,
//       skippedPastWorkouts,
//       skippedPastMeals,
//       keptByWeekNumber,
//       totalTime: `${totalTime}ms`,
//     });

//     return NextResponse.json({ plans: filtered || [] })
//   } catch (error: any) {
//     const totalTime = Date.now() - startTime;
//     console.error("[API] GET /api/personalized-plans - Error:", {
//       error: error.message,
//       stack: error.stack,
//       name: error.name,
//       totalTime: `${totalTime}ms`,
//     });
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
//   }
// }

// export async function PATCH(request: NextRequest) {
//   const startTime = Date.now();
//   console.log("[API] PATCH /api/personalized-plans - Request started");
  
//   try {
//     const supabase = await getSupabaseForRequest(request)

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()

//     if (authError || !user) {
//       console.error("[API] PATCH - Authentication failed:", {
//         hasUser: !!user,
//         authError: authError?.message,
//       });
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await request.json()
//     const { planId, completed } = body

//     console.log("[API] PATCH - Request body:", {
//       planId,
//       completed,
//       userId: user.id,
//     });

//     if (!planId || typeof completed !== "boolean") {
//       console.error("[API] PATCH - Validation failed:", {
//         hasPlanId: !!planId,
//         completedType: typeof completed,
//       });
//       return NextResponse.json({ error: "Missing planId or completed status" }, { status: 400 })
//     }

//     console.log("[API] PATCH - Updating plan in database...");
//     const { data, error } = await supabase
//       .from("personalized_plans")
//       .update({ completed })
//       .eq("id", planId)
//       .eq("user_id", user.id)
//       .select()
//       .single()

//     const queryTime = Date.now() - startTime;

//     if (error) {
//       console.error("[API] PATCH - Database update error:", {
//         error: error.message,
//         code: error.code,
//         details: error.details,
//         planId,
//         queryTime: `${queryTime}ms`,
//       });
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     console.log("[API] PATCH - Plan updated successfully:", {
//       planId: data?.id,
//       completed: data?.completed,
//       planType: data?.plan_type,
//       weekNumber: data?.week_number,
//       queryTime: `${queryTime}ms`,
//       totalTime: `${Date.now() - startTime}ms`,
//     });

//     return NextResponse.json({ plan: data })
//   } catch (error: any) {
//     const totalTime = Date.now() - startTime;
//     console.error("[API] PATCH /api/personalized-plans - Error:", {
//       error: error.message,
//       stack: error.stack,
//       name: error.name,
//       totalTime: `${totalTime}ms`,
//     });
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(request: NextRequest) {
//   console.log("[API] DELETE /api/personalized-plans - Request started");

//   try {
//     const supabase = await getSupabaseForRequest(request)

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()

//     if (authError || !user) {
//       console.error("[API] DELETE - Authentication failed:", {
//         hasUser: !!user,
//         authError: authError?.message,
//       });
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     console.log("[API] DELETE - User authenticated:", {
//       userId: user.id,
//       email: user.email,
//     });

//     // Delete all personalized plans for this user
//     console.log("[API] DELETE - Deleting all plans for user...");
//     const { error, count } = await supabase.from("personalized_plans").delete().eq("user_id", user.id)

//     if (error) {
//       console.error("[API] DELETE - Database error:", {
//         error: error.message,
//         code: error.code,
//       });
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     console.log("[API] DELETE - Plans deleted successfully:", {
//       userId: user.id,
//       count: count || "unknown",
//     });

//     return NextResponse.json({ success: true, message: "All plans deleted successfully" })
//   } catch (error: any) {
//     console.error("[API] DELETE /api/personalized-plans - Error:", {
//       error: error.message,
//       stack: error.stack,
//     });
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
//   }
// }

// app/api/personalized-plans/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

// --- Helpers ----------------------------------------------------

function isoWeekNumber(date: Date) {
  // Standard ISO week algorithm
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7)
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("[API] GET /api/personalized-plans - Request started")

  try {
    const supabase = await getSupabaseForRequest(request)
    console.log("[API] Supabase client created successfully")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[API] Authentication failed:", {
        hasUser: !!user,
        authError: authError?.message,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[API] User authenticated:", {
      userId: user.id,
      email: user.email,
    })

    const { searchParams } = new URL(request.url)
    const planType = searchParams.get("type") // 'workout' or 'meal'
    const weekParam = searchParams.get("week") // relative week index from UI (1 = current)
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("[API] Query parameters (raw):", {
      planType: planType || "all",
      weekParam: weekParam || "none",
      date: date || "none",
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : "none",
      url: request.url,
    })

    let query = supabase
      .from("personalized_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (planType) {
      query = query.eq("plan_type", planType)
      console.log("[API] Filtering by plan_type:", planType)
    }

    // ----- Date-based queries (new day-by-day storage) -----
    if (date) {
      query = query.eq("date", date)
      console.log("[API] Filtering by exact date:", date)
    } else if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate)
      console.log("[API] Filtering by date range:", startDate, "to", endDate)
    }

    // ----- Week-based queries (relative from current week) -----
    if (weekParam && !date && !startDate) {
      const relativeWeek = Number.parseInt(weekParam, 10) || 1 // Week 1 = current week
      const today = new Date()
      const currentIsoWeek = isoWeekNumber(today)
      const targetWeekNumber = currentIsoWeek + (relativeWeek - 1)

      query = query.eq("week_number", targetWeekNumber)

      console.log("[API] Filtering by week_number (relative):", {
        relativeWeek,
        currentIsoWeek,
        targetWeekNumber,
      })
    }

    // Order by date if available, otherwise by week_number
    if (date || startDate) {
      query = query.order("date", { ascending: true })
    } else {
      query = query.order("week_number", { ascending: true })
    }

    console.log("[API] Executing database query...")
    const { data, error } = await query
    const queryTime = Date.now() - startTime

    if (error) {
      console.error("[API] Database query error:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        queryTime: `${queryTime}ms`,
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[API] Database query successful:", {
      plansFound: data?.length || 0,
      weekNumbers: (data || []).map((p: any) => p.week_number),
      queryTime: `${queryTime}ms`,
    })

    // ----- Filter by "from today onwards" for content dates -----
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentDay = now.getDay()
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay
    const week1End = new Date(today)
    week1End.setDate(week1End.getDate() + daysUntilSunday)

    console.log("[API] Starting date filtering:", {
      currentDate: today.toISOString().split("T")[0],
      currentDayOfWeek: currentDay,
      daysUntilSunday,
      week1End: week1End.toISOString().split("T")[0],
      plansBeforeFilter: data?.length || 0,
    })

    let filteredCount = 0
    let skippedPastWorkouts = 0
    let skippedPastMeals = 0
    let keptByWeekNumber = 0

    const filtered = (data || []).filter((plan: any) => {
      if (plan.content) {
        // Workout plans
        if (plan.content.workouts && Array.isArray(plan.content.workouts)) {
          const hasValidWorkout = plan.content.workouts.some((w: any) => {
            if (w.date) {
              const workoutDate = new Date(w.date)
              const isValid = workoutDate >= today
              if (!isValid) skippedPastWorkouts++
              return isValid
            }
            keptByWeekNumber++
            return plan.week_number >= 1
          })
          if (hasValidWorkout) filteredCount++
          return hasValidWorkout
        }

        // Meal plans
        if (plan.content.dailyPlan && Array.isArray(plan.content.dailyPlan)) {
          const hasValidMeal = plan.content.dailyPlan.some((d: any) => {
            if (d.date) {
              const mealDate = new Date(d.date)
              const isValid = mealDate >= today
              if (!isValid) skippedPastMeals++
              return isValid
            }
            keptByWeekNumber++
            return plan.week_number >= 1
          })
          if (hasValidMeal) filteredCount++
          return hasValidMeal
        }
      }

      // Fallback: include if week_number is non-zero (backward compat)
      keptByWeekNumber++
      filteredCount++
      return plan.week_number >= 1
    })

    const totalTime = Date.now() - startTime
    console.log("[API] Date filtering completed:", {
      plansBeforeFilter: data?.length || 0,
      plansAfterFilter: filtered?.length || 0,
      filteredCount,
      skippedPastWorkouts,
      skippedPastMeals,
      keptByWeekNumber,
      totalTime: `${totalTime}ms`,
    })

    return NextResponse.json({ plans: filtered || [] })
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error("[API] GET /api/personalized-plans - Error:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
      totalTime: `${totalTime}ms`,
    })
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}

// PATCH & DELETE unchanged ---------------------------------------

export async function PATCH(request: NextRequest) {
  const startTime = Date.now()
  console.log("[API] PATCH /api/personalized-plans - Request started")

  try {
    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[API] PATCH - Authentication failed:", {
        hasUser: !!user,
        authError: authError?.message,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, completed } = body

    console.log("[API] PATCH - Request body:", {
      planId,
      completed,
      userId: user.id,
    })

    if (!planId || typeof completed !== "boolean") {
      console.error("[API] PATCH - Validation failed:", {
        hasPlanId: !!planId,
        completedType: typeof completed,
      })
      return NextResponse.json(
        { error: "Missing planId or completed status" },
        { status: 400 },
      )
    }

    console.log("[API] PATCH - Updating plan in database...")
    const { data, error } = await supabase
      .from("personalized_plans")
      .update({ completed })
      .eq("id", planId)
      .eq("user_id", user.id)
      .select()
      .single()

    const queryTime = Date.now() - startTime

    if (error) {
      console.error("[API] PATCH - Database update error:", {
        error: error.message,
        code: error.code,
        details: error.details,
        planId,
        queryTime: `${queryTime}ms`,
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[API] PATCH - Plan updated successfully:", {
      planId: data?.id,
      completed: data?.completed,
      planType: data?.plan_type,
      weekNumber: data?.week_number,
      queryTime: `${queryTime}ms`,
      totalTime: `${Date.now() - startTime}ms`,
    })

    return NextResponse.json({ plan: data })
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error("[API] PATCH /api/personalized-plans - Error:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
      totalTime: `${totalTime}ms`,
    })
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[API] DELETE /api/personalized-plans - Request started")

  try {
    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[API] DELETE - Authentication failed:", {
        hasUser: !!user,
        authError: authError?.message,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[API] DELETE - User authenticated:", {
      userId: user.id,
      email: user.email,
    })

    const { error, count } = await supabase
      .from("personalized_plans")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      console.error("[API] DELETE - Database error:", {
        error: error.message,
        code: error.code,
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[API] DELETE - Plans deleted successfully:", {
      userId: user.id,
      count: count || "unknown",
    })

    return NextResponse.json({
      success: true,
      message: "All plans deleted successfully",
    })
  } catch (error: any) {
    console.error("[API] DELETE /api/personalized-plans - Error:", {
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}
