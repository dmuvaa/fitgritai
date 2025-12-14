#!/usr/bin/env node
/**
 * Create Supabase Storage structure for Exercise Guides
 * - Prefers NEXT_PUBLIC_* vars (from Next.js)
 * - Falls back to EXPO_PUBLIC_* or root SUPABASE_URL
 * - Uses SERVICE ROLE if present (best) or ANON (limited)
 *
 * Place this file at: /scripts/create-storage-structure.cjs
 * Run: node scripts/create-storage-structure.cjs
 */

const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Load env from multiple locations (quietly)
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // root
dotenv.config({ path: path.resolve(process.cwd(), "app/.env.local") }); // Next
dotenv.config({ path: path.resolve(process.cwd(), "mobile/.env") }); // Expo

// Resolve envs (prefer NEXT_PUBLIC_ per your request)
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

// Bucket name
const BUCKET = process.env.EXERCISE_GUIDES_BUCKET || "exercise-guides";

// Validate minimal env
if (!SUPABASE_URL) {
  console.error("❌ Missing SUPABASE URL (NEXT_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL / SUPABASE_URL).");
  process.exit(1);
}

if (!ANON_KEY && !SERVICE_ROLE_KEY) {
  console.error("❌ Provide at least an ANON key (NEXT_PUBLIC_SUPABASE_ANON_KEY / EXPO_PUBLIC_SUPABASE_ANON_KEY) or SERVICE_ROLE_KEY.");
  process.exit(1);
}

// Choose the best key we have: service > anon
const AUTH_KEY = SERVICE_ROLE_KEY || ANON_KEY;
const supabase = createClient(SUPABASE_URL, AUTH_KEY, {
  auth: { persistSession: false },
});

const USING_SERVICE = Boolean(SERVICE_ROLE_KEY);

console.log(`\n🔧 Supabase project: ${SUPABASE_URL}`);
console.log(`📦 Bucket: ${BUCKET}`);
console.log(`🔑 Mode: ${USING_SERVICE ? "SERVICE ROLE (admin)" : "ANON (limited, must match storage policies)"}\n`);

// -------------------------------------------
// Taxonomy → Focus areas → Exercises
// (add/expand as you like)
// -------------------------------------------
const STRUCTURE = {
  chest: {
    "upper-chest": [
      "incline-dumbbell-press",
      "incline-barbell-press",
      "incline-smith-press",
      "incline-cable-fly",
    ],
    "mid-chest": [
      "barbell-bench-press",
      "dumbbell-bench-press",
      "machine-chest-press",
      "push-up",
      "cable-fly",
    ],
    "lower-chest": [
      "decline-barbell-press",
      "decline-dumbbell-press",
      "dip-lean-forward",
      "high-to-low-cable-fly",
    ],
    "inner-chest": ["cable-crossover", "plate-squeeze-press"],
    "outer-chest": ["wide-grip-bench-press", "neutral-grip-db-press"],
  },

  back: {
    lats: [
      "lat-pulldown",
      "pull-up",
      "chin-up",
      "straight-arm-pulldown",
      "one-arm-lat-pulldown",
    ],
    "mid-back": [
      "barbell-bent-over-row",
      "seated-cable-row",
      "t-bar-row",
      "one-arm-dumbbell-row",
    ],
    "lower-back": ["back-extension-hyperextension", "romanian-deadlift", "good-morning"],
  },

  legs: {
    quads: [
      "barbell-back-squat",
      "front-squat",
      "leg-press",
      "hack-squat",
      "leg-extension",
      "bulgarian-split-squat",
    ],
    hamstrings: [
      "romanian-deadlift",
      "lying-leg-curl",
      "seated-leg-curl",
      "good-morning",
      "glute-ham-raise",
    ],
    glutes: [
      "barbell-hip-thrust",
      "glute-bridge",
      "step-up",
      "bulgarian-split-squat",
      "reverse-lunge",
    ],
    calves: ["standing-calf-raise", "seated-calf-raise", "calf-press-on-leg-press"],
  },

  shoulders: {
    anterior: [
      "overhead-barbell-press",
      "dumbbell-shoulder-press",
      "arnold-press",
      "front-raise",
    ],
    lateral: ["lateral-raise-dumbbell", "cable-lateral-raise", "machine-lateral-raise"],
    posterior: ["rear-delt-fly", "reverse-pec-deck", "face-pull"],
    traps: ["barbell-shrug", "dumbbell-shrug"],
  },

  arms: {
    biceps: [
      "barbell-curl",
      "dumbbell-curl",
      "incline-dumbbell-curl",
      "preacher-curl",
      "cable-curl",
      "hammer-curl",
      "concentration-curl",
    ],
    triceps: [
      "close-grip-bench-press",
      "lying-triceps-extension-skullcrusher",
      "cable-rope-pushdown",
      "overhead-triceps-extension",
      "dips-triceps",
    ],
    forearms: [
      "wrist-curl",
      "reverse-wrist-curl",
      "farmer-walk",
      "towel-pull-up",
      "plate-pinches",
    ],
  },

  core: {
    abs: [
      "crunch",
      "hanging-leg-raise",
      "cable-crunch",
      "ab-wheel-rollout",
      "plank",
      "reverse-crunch",
    ],
    obliques: ["russian-twist", "side-plank", "cable-woodchop", "landmine-rotation"],
    "lower-back": ["back-extension-hyperextension", "bird-dog"],
  },

  cardio: {
    machines: [
      "treadmill-run",
      "spin-bike",
      "air-bike",
      "rower",
      "elliptical",
      "stair-climber",
      "ski-erg",
    ],
  },

  others: {
    mobility: ["hip-flexor-stretch", "hamstring-stretch", "shoulder-dislocate"],
    warmup: ["band-pull-apart", "jump-rope", "light-rower"],
  },
};

// For each exercise folder also create these subfolders:
const MEDIA_SUBFOLDERS = ["images", "gifs", "videos"];

/**
 * Ensures the bucket exists and is public.
 * Requires service role. If not available, skip with a note.
 */
async function ensureBucketPublic(supabase, bucketId) {
  if (!USING_SERVICE) {
    console.log("ℹ️  No service role provided; skipping bucket creation (requires admin).");
    return;
  }

  // Check if bucket exists
  const { data: list, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.warn("⚠️  Could not list buckets:", listErr.message);
    return;
  }
  if (list?.some((b) => b.id === bucketId)) {
    console.log(`✅ Bucket "${bucketId}" already exists.`);
    return;
  }

  // Create if missing
  const { data: created, error: createErr } = await supabase.storage.createBucket(bucketId, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
  });
  if (createErr) {
    console.warn(`⚠️  Failed to create bucket "${bucketId}":`, createErr.message);
    return;
  }
  console.log(`✅ Created bucket "${bucketId}" as public.`);
}

/**
 * Uploads a tiny placeholder file to simulate folder creation.
 */
async function ensurePlaceholder(objectPath) {
  const content = Buffer.from("placeholder");
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, content, {
      contentType: "text/plain",
      upsert: true,
    });
  return error;
}

(async () => {
  await ensureBucketPublic(supabase, BUCKET);

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  // Build a list of paths to create
  const paths = [];

  for (const [region, focusAreas] of Object.entries(STRUCTURE)) {
    for (const [focus, exercises] of Object.entries(focusAreas)) {
      // "Folder" placeholder
      paths.push(`${region}/${focus}/.keep`);
      for (const ex of exercises) {
        paths.push(`${region}/${focus}/${ex}/.keep`);
        for (const sub of MEDIA_SUBFOLDERS) {
          paths.push(`${region}/${focus}/${ex}/${sub}/.keep`);
        }
      }
    }
  }

  console.log(`🗂️  Will ensure ${paths.length} storage objects exist...\n`);

  // Create all
  for (const p of paths) {
    const err = await ensurePlaceholder(p);
    if (!err) {
      created++;
      process.stdout.write(`+ ${p}\n`);
    } else {
      // If it's a 409 conflict (already exists) or policy block
      if (String(err.message || "").toLowerCase().includes("duplicate")) {
        skipped++;
      } else if (String(err.message || "").toLowerCase().includes("not allowed")) {
        failed++;
        failures.push({ path: p, error: err.message });
      } else if (String(err.message || "").includes("403") || String(err.status) === "403") {
        failed++;
        failures.push({ path: p, error: err.message });
      } else {
        // Might be "The resource already exists" (Supabase returns 409)
        if ((err.status === 409) || /already exists|duplicate/i.test(err.message)) {
          skipped++;
        } else {
          failed++;
          failures.push({ path: p, error: err.message });
        }
      }
    }
  }

  console.log("\n— Summary —");
  console.log(`✅ Created: ${created}`);
  console.log(`◻️  Skipped (exists): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nSome failures occurred. Common reasons:");
    console.log(" • Using ANON key and storage INSERT policy requires auth (auth.uid() is not null).");
    console.log(" • Bucket is not public or write policy is too strict.");
    console.log(" • If possible, re-run with SUPABASE_SERVICE_ROLE_KEY in root .env.");
    console.log("\nFailed items:");
    failures.slice(0, 10).forEach((f) => console.log(` - ${f.path}: ${f.error}`));
    if (failures.length > 10) console.log(` ...and ${failures.length - 10} more`);
  }

  console.log(
    `\nDone. You can now upload media (images/gifs/videos) into these folders in Supabase Studio under bucket "${BUCKET}".`
  );
})().catch((e) => {
  console.error("\nUnhandled error:", e);
  process.exit(1);
});
