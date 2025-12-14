// app/api/personalized-plans/generate-from-data/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseForRequest } from "@/utils/supabase/api-request";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ScheduleDaySchema = z.object({
  day: z.enum(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]),
  focus: z.string().min(1),
});

const ScheduleWeekSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  schedule: z.array(ScheduleDaySchema).min(1).max(7),
});

// Edge function URL (your dynamic endpoint)
const EDGE_FUNCTION_URL =
  process.env.SUPABASE_EDGE_FUNCTION_URL ??
  "https://hipdgmzzdvipcsqxqnhn.supabase.co/functions/v1/dynamic-endpoint";

// ------------------------- GET: job status -------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_id");
    if (!jobId) return NextResponse.json({ error: "job_id is required" }, { status: 400 });

    const supabase = await getSupabaseForRequest(request);
    const { data, error } = await supabase
      .from("plan_generation_jobs")
      .select("id,status,progress_data,completed_at,error_message,result_payload")
      .eq("id", jobId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({
      id: data.id,
      status: data.status,
      progress: data.progress_data,
      completed_at: data.completed_at,
      error: data.error_message,
      result: data.result_payload,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

// ------------------------- POST: schedule job -------------------------
export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const supabase = await getSupabaseForRequest(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ScheduleWeekSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.errors }, { status: 400 });
    }

    // Ensure fitness profile exists
    const { data: profile, error: pErr } = await supabase
      .from("user_fitness_profile")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pErr || !profile) {
      return NextResponse.json(
        { error: "Fitness profile not found. Complete your profile first.", code: "NO_PROFILE" },
        { status: 404 }
      );
    }

    // Create job row (store JSON object as jsonb)
    const { data: job, error: jobErr } = await supabase
      .from("plan_generation_jobs")
      .insert({
        user_id: user.id,
        status: "pending",
        request_payload: parsed.data, // jsonb, not string
      })
      .select()
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Failed to create job", details: jobErr?.message }, { status: 500 });
    }

    // Trigger Edge Function (fire-and-forget) -> dynamic-endpoint
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // service role ensures the function can bypass RLS as needed
        Authorization: `Bearer ${svcKey}`,
        apikey: svcKey,
      },
      body: JSON.stringify({ job_id: job.id, user_id: user.id }),
    }).catch(async (err) => {
      await supabase
        .from("plan_generation_jobs")
        .update({ status: "failed", error_message: `Worker trigger error: ${err?.message || String(err)}` })
        .eq("id", job.id);
    });

    return NextResponse.json(
      { message: "Job scheduled", job_id: job.id, status: "pending", elapsed_ms: Date.now() - started },
      { status: 202 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

// ------------------------- PUT: retry / force-run a job -------------------------
// Body: { job_id: string, user_id?: string }
// If user_id is omitted, we look it up from plan_generation_jobs
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request);

    // Require authenticated caller (you can relax this if it's server-only)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // You can switch this to 200 if you want server-to-server only and skip auth
      // but keeping 401 is safer by default.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const job_id: string | undefined = body?.job_id;
    let user_id: string | undefined = body?.user_id;

    if (!job_id) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    // If user_id not provided, fetch from DB
    if (!user_id) {
      const { data: jobRow, error: jErr } = await supabase
        .from("plan_generation_jobs")
        .select("user_id")
        .eq("id", job_id)
        .maybeSingle();
      if (jErr) return NextResponse.json({ error: jErr.message }, { status: 500 });
      if (!jobRow) return NextResponse.json({ error: "Job not found" }, { status: 404 });
      user_id = jobRow.user_id;
    }

    // Mark job back to pending (optional, but helps UI)
    await supabase
      .from("plan_generation_jobs")
      .update({ status: "pending", error_message: null })
      .eq("id", job_id);

    // Trigger the dynamic-endpoint explicitly
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const resp = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${svcKey}`,
        apikey: svcKey,
      },
      body: JSON.stringify({ job_id, user_id }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      await supabase
        .from("plan_generation_jobs")
        .update({ status: "failed", error_message: `Worker HTTP ${resp.status}: ${text}` })
        .eq("id", job_id);
      return NextResponse.json({ error: `Worker failed: ${resp.status}`, details: text }, { status: 502 });
    }

    return NextResponse.json({ message: "Worker triggered", job_id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
