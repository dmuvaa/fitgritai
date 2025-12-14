-- =============================================================================
-- Exercise Guides & Media (Technique Library)
-- =============================================================================

-- Create public bucket for guide media (videos, GIFs, images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-guides', 'exercise-guides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =============================================================================
-- Taxonomy Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercise_body_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  accent_color TEXT DEFAULT '#7c3aed',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_focus_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_region_id UUID NOT NULL REFERENCES exercise_body_regions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Guides, Steps, Media
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercise_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_area_id UUID NOT NULL REFERENCES exercise_focus_areas(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment TEXT[] DEFAULT '{}',
  primary_muscles TEXT[] DEFAULT '{}',
  secondary_muscles TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  tempo TEXT,
  needs_equipment BOOLEAN NOT NULL DEFAULT false,
  estimated_duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  order_index INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  cover_media_path TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_guide_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES exercise_guides(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'gif', 'video')),
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT,
  label TEXT,
  duration_seconds INTEGER,
  aspect_ratio NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (guide_id, order_index)
);

CREATE TABLE IF NOT EXISTS exercise_guide_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES exercise_guides(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  focus_cue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (guide_id, order_index)
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_focus_areas_body_region ON exercise_focus_areas(body_region_id);
CREATE INDEX IF NOT EXISTS idx_guides_focus_area ON exercise_guides(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_guides_status ON exercise_guides(status);
CREATE INDEX IF NOT EXISTS idx_guides_order ON exercise_guides(order_index);

-- =============================================================================
-- Row Level Security & Policies
-- =============================================================================

ALTER TABLE exercise_body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_guide_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_guide_steps ENABLE ROW LEVEL SECURITY;

-- Public read access (data is non-sensitive)
CREATE POLICY "exercise_body_regions_public_select"
ON exercise_body_regions
FOR SELECT
USING (true);

CREATE POLICY "exercise_focus_areas_public_select"
ON exercise_focus_areas
FOR SELECT
USING (true);

CREATE POLICY "exercise_guides_public_select"
ON exercise_guides
FOR SELECT
USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "exercise_guide_media_public_select"
ON exercise_guide_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exercise_guides g
    WHERE g.id = guide_id
      AND (g.status = 'published' OR g.created_by = auth.uid())
  )
);

CREATE POLICY "exercise_guide_steps_public_select"
ON exercise_guide_steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exercise_guides g
    WHERE g.id = guide_id
      AND (g.status = 'published' OR g.created_by = auth.uid())
  )
);

-- Authenticated creators can manage their guides
CREATE POLICY "exercise_guides_owner_insert"
ON exercise_guides
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercise_guides_owner_update"
ON exercise_guides
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercise_guides_owner_delete"
ON exercise_guides
FOR DELETE
USING (created_by = auth.uid());

-- Storage policies
CREATE POLICY "exercise_guides_media_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'exercise-guides');

CREATE POLICY "exercise_guides_media_authenticated_write"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'exercise-guides' AND auth.uid() IS NOT NULL);

CREATE POLICY "exercise_guides_media_authenticated_update"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'exercise-guides' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'exercise-guides' AND auth.uid() IS NOT NULL);

CREATE POLICY "exercise_guides_media_authenticated_delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'exercise-guides' AND auth.uid() IS NOT NULL);

-- =============================================================================
-- Seed Data (Baseline Body Regions, Focus Areas & Sample Guides)
-- =============================================================================

-- Body Regions
INSERT INTO exercise_body_regions (slug, name, description, hero_image_url, accent_color, order_index)
VALUES
  ('chest', 'Chest', 'Pressing patterns focused on the pectorals.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80', '#f97316', 1),
  ('legs', 'Legs', 'Quad, hamstring and glute development.', 'https://images.unsplash.com/photo-1507537509458-b8312d35a233?auto=format&fit=crop&w=1600&q=80', '#8b5cf6', 2)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  hero_image_url = EXCLUDED.hero_image_url,
  accent_color = EXCLUDED.accent_color,
  order_index = EXCLUDED.order_index;

-- Focus Areas
INSERT INTO exercise_focus_areas (slug, name, description, body_region_id, order_index)
VALUES
  ('upper-chest', 'Upper Chest', 'Incline press variations for clavicular fibers.', (SELECT id FROM exercise_body_regions WHERE slug = 'chest'), 1),
  ('mid-chest', 'Mid Chest', 'Horizontal pressing builds the thick mid chest.', (SELECT id FROM exercise_body_regions WHERE slug = 'chest'), 2),
  ('quads', 'Quadriceps', 'Knee-dominant patterns for the front of the legs.', (SELECT id FROM exercise_body_regions WHERE slug = 'legs'), 1),
  ('glutes-hamstrings', 'Glutes & Hamstrings', 'Hip hinge elements for posterior chain.', (SELECT id FROM exercise_body_regions WHERE slug = 'legs'), 2)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  body_region_id = EXCLUDED.body_region_id,
  order_index = EXCLUDED.order_index;

-- Guides
INSERT INTO exercise_guides (
  slug,
  name,
  summary,
  focus_area_id,
  difficulty,
  equipment,
  primary_muscles,
  secondary_muscles,
  tags,
  tempo,
  needs_equipment,
  order_index,
  cover_media_path,
  thumbnail_url,
  estimated_duration_seconds
)
VALUES
  (
    'barbell-bench-press',
    'Barbell Bench Press',
    'Foundation compound lift to build the entire chest with progressive overload.',
    (SELECT id FROM exercise_focus_areas WHERE slug = 'mid-chest'),
    'intermediate',
    ARRAY['Barbell', 'Flat bench']::TEXT[],
    ARRAY['pectoralis major', 'triceps brachii']::TEXT[],
    ARRAY['anterior deltoid']::TEXT[],
    ARRAY['compound', 'strength']::TEXT[],
    '3-1-X-1',
    true,
    1,
    'chest/bench-press/bench-press.mp4',
    'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1200&q=80',
    75
  ),
  (
    'incline-dumbbell-press',
    'Incline Dumbbell Press',
    'Independent dumbbell pressing to emphasize the clavicular (upper) chest.',
    (SELECT id FROM exercise_focus_areas WHERE slug = 'upper-chest'),
    'beginner',
    ARRAY['Adjustable bench', 'Dumbbells']::TEXT[],
    ARRAY['upper chest', 'anterior deltoid']::TEXT[],
    ARRAY['triceps brachii']::TEXT[],
    ARRAY['hypertrophy', 'tempo']::TEXT[],
    '2-1-2-1',
    true,
    2,
    'chest/incline-press/incline-press.mp4',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80',
    60
  ),
  (
    'machine-chest-press',
    'Machine Chest Press',
    'Guided pressing pattern for controlled tension without stabilizer fatigue.',
    (SELECT id FROM exercise_focus_areas WHERE slug = 'mid-chest'),
    'beginner',
    ARRAY['Chest press machine']::TEXT[],
    ARRAY['pectoralis major']::TEXT[],
    ARRAY['triceps brachii', 'deltoids']::TEXT[],
    ARRAY['stability', 'volume']::TEXT[],
    '2-1-2-1',
    true,
    3,
    'chest/machine-press/machine-press.mp4',
    'https://images.unsplash.com/photo-1599058918147-89bff57bf20c?auto=format&fit=crop&w=1200&q=80',
    55
  ),
  (
    'leg-extension',
    'Leg Extension',
    'Isolate the quadriceps and finish with metabolic stress.',
    (SELECT id FROM exercise_focus_areas WHERE slug = 'quads'),
    'beginner',
    ARRAY['Leg extension machine']::TEXT[],
    ARRAY['quadriceps']::TEXT[],
    ARRAY['rectus femoris']::TEXT[],
    ARRAY['isolation', 'burnout']::TEXT[],
    '2-1-2-2',
    true,
    1,
    'legs/leg-extension/leg-extension.mp4',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80',
    50
  ),
  (
    'bulgarian-split-squat',
    'Bulgarian Split Squat',
    'Single-leg crusher for quads and glutes using limited equipment.',
    (SELECT id FROM exercise_focus_areas WHERE slug = 'glutes-hamstrings'),
    'intermediate',
    ARRAY['Bench', 'Dumbbells (optional)']::TEXT[],
    ARRAY['glute max', 'quadriceps']::TEXT[],
    ARRAY['adductors', 'core']::TEXT[],
    ARRAY['balance', 'unilateral']::TEXT[],
    '3-1-1-1',
    false,
    2,
    'legs/bulgarian-split-squat/bulgarian-split-squat.mp4',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    65
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  summary = EXCLUDED.summary,
  focus_area_id = EXCLUDED.focus_area_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  tags = EXCLUDED.tags,
  tempo = EXCLUDED.tempo,
  needs_equipment = EXCLUDED.needs_equipment,
  order_index = EXCLUDED.order_index,
  cover_media_path = EXCLUDED.cover_media_path,
  thumbnail_url = EXCLUDED.thumbnail_url,
  estimated_duration_seconds = EXCLUDED.estimated_duration_seconds;

-- Steps
WITH guide_ids AS (
  SELECT id, slug FROM exercise_guides
  WHERE slug IN (
    'barbell-bench-press',
    'incline-dumbbell-press',
    'machine-chest-press',
    'leg-extension',
    'bulgarian-split-squat'
  )
)
INSERT INTO exercise_guide_steps (guide_id, order_index, title, description, focus_cue)
VALUES
  ((SELECT id FROM guide_ids WHERE slug = 'barbell-bench-press'), 1, 'Set your base', 'Lie on the bench, dig shoulder blades down and keep hips glued to the pad.', 'Brace hard before unrack'),
  ((SELECT id FROM guide_ids WHERE slug = 'barbell-bench-press'), 2, 'Control the descent', 'Lower the bar to mid chest tracking under the nipple line for consistent leverage.', 'Elbows at ~45°'),
  ((SELECT id FROM guide_ids WHERE slug = 'barbell-bench-press'), 3, 'Drive & finish', 'Press the bar explosively, finishing with wrists stacked over elbows.', 'Push the floor away'),

  ((SELECT id FROM guide_ids WHERE slug = 'incline-dumbbell-press'), 1, 'Pack the shoulders', 'Set an incline (25-35°) and squeeze shoulder blades before unracking.', 'Keep rib cage down'),
  ((SELECT id FROM guide_ids WHERE slug = 'incline-dumbbell-press'), 2, 'Arc through midline', 'Lower dumbbells in an arc until elbows hit 90° or a comfortable stretch.', 'Forearms stay vertical'),
  ((SELECT id FROM guide_ids WHERE slug = 'incline-dumbbell-press'), 3, 'Squeeze at top', 'Press and bring bells toward each other without clanking for maximum tension.', 'Exhale & flex chest'),

  ((SELECT id FROM guide_ids WHERE slug = 'machine-chest-press'), 1, 'Dial the seat height', 'Handle should align with mid chest or slightly below nipple line.', 'Keep wrists neutral'),
  ((SELECT id FROM guide_ids WHERE slug = 'machine-chest-press'), 2, 'Slow eccentric', 'Control the handles back for a 2-3 second stretch.', 'Keep scapula pinned'),
  ((SELECT id FROM guide_ids WHERE slug = 'machine-chest-press'), 3, 'Explosive concentric', 'Drive until elbows almost lock, maintaining constant tension.', 'Don’t shrug up'),

  ((SELECT id FROM guide_ids WHERE slug = 'leg-extension'), 1, 'Align knee with pivot', 'Seat depth so knees align with machine axis, toes slightly up.', 'Grip handles tight'),
  ((SELECT id FROM guide_ids WHERE slug = 'leg-extension'), 2, 'Kick & squeeze', 'Extend until knees almost lock, pausing 1s at top for quad squeeze.', 'Lead with shins'),
  ((SELECT id FROM guide_ids WHERE slug = 'leg-extension'), 3, 'Controlled lowering', 'Descend over 2 seconds keeping tension in quads.', 'Don’t let stack slam'),

  ((SELECT id FROM guide_ids WHERE slug = 'bulgarian-split-squat'), 1, 'Find posture', 'Stand ~2ft in front of bench, rear laces on pad, torso tall.', 'Hips square'),
  ((SELECT id FROM guide_ids WHERE slug = 'bulgarian-split-squat'), 2, 'Drop straight down', 'Front shin stays vertical while back knee lowers toward floor.', 'Weight mid-foot'),
  ((SELECT id FROM guide_ids WHERE slug = 'bulgarian-split-squat'), 3, 'Drive through front leg', 'Push the floor away, finishing with glute squeeze at top.', 'Exhale up')
ON CONFLICT (guide_id, order_index) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  focus_cue = EXCLUDED.focus_cue;

-- Media
WITH guide_ids AS (
  SELECT id, slug FROM exercise_guides
  WHERE slug IN (
    'barbell-bench-press',
    'incline-dumbbell-press',
    'machine-chest-press',
    'leg-extension',
    'bulgarian-split-squat'
  )
)
INSERT INTO exercise_guide_media (guide_id, order_index, media_type, storage_path, thumbnail_url, label, duration_seconds, aspect_ratio)
VALUES
  ((SELECT id FROM guide_ids WHERE slug = 'barbell-bench-press'), 1, 'video', 'chest/bench-press/bench-press.mp4', 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=800&q=80', 'Full rep demo', 18, 16.0/9.0),
  ((SELECT id FROM guide_ids WHERE slug = 'barbell-bench-press'), 2, 'gif', 'chest/bench-press/bench-press-loop.gif', NULL, 'Tempo loop', 0, 4.0/5.0),

  ((SELECT id FROM guide_ids WHERE slug = 'incline-dumbbell-press'), 1, 'video', 'chest/incline-press/incline-press.mp4', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80', 'Incline press', 20, 16.0/9.0),
  ((SELECT id FROM guide_ids WHERE slug = 'incline-dumbbell-press'), 2, 'image', 'chest/incline-press/top-position.jpg', 'https://images.unsplash.com/photo-1599058918147-89bff57bf20c?auto=format&fit=crop&w=800&q=80', 'Top position', NULL, 4.0/5.0),

  ((SELECT id FROM guide_ids WHERE slug = 'machine-chest-press'), 1, 'video', 'chest/machine-press/machine-press.mp4', 'https://images.unsplash.com/photo-1599058918166-736a1fa4c37f?auto=format&fit=crop&w=800&q=80', 'Machine press', 16, 16.0/9.0),

  ((SELECT id FROM guide_ids WHERE slug = 'leg-extension'), 1, 'video', 'legs/leg-extension/leg-extension.mp4', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80', 'Isolation demo', 14, 16.0/9.0),
  ((SELECT id FROM guide_ids WHERE slug = 'leg-extension'), 2, 'image', 'legs/leg-extension/lockout.jpg', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80', 'Lockout cue', NULL, 4.0/5.0),

  ((SELECT id FROM guide_ids WHERE slug = 'bulgarian-split-squat'), 1, 'video', 'legs/bulgarian-split-squat/bulgarian-split-squat.mp4', 'https://images.unsplash.com/photo-1599058918147-89bff57bf20c?auto=format&fit=crop&w=800&q=80', 'Unilateral focus', 22, 16.0/9.0),
  ((SELECT id FROM guide_ids WHERE slug = 'bulgarian-split-squat'), 2, 'gif', 'legs/bulgarian-split-squat/bulgarian-split-squat-loop.gif', NULL, 'Looped tempo', 0, 3.0/4.0)
ON CONFLICT (guide_id, order_index) DO UPDATE
SET
  media_type = EXCLUDED.media_type,
  storage_path = EXCLUDED.storage_path,
  thumbnail_url = EXCLUDED.thumbnail_url,
  label = EXCLUDED.label,
  duration_seconds = EXCLUDED.duration_seconds,
  aspect_ratio = EXCLUDED.aspect_ratio;

