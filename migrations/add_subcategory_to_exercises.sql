-- Add subcategory field to exercises table for better grouping
-- This allows exercises to be grouped by muscle groups (Chest, Back, Legs, etc.)

-- Add subcategory column
ALTER TABLE exercises 
ADD COLUMN subcategory TEXT;

-- Create index for efficient filtering
CREATE INDEX idx_exercises_category_subcategory_name 
ON exercises (category_id, subcategory, name);

-- Update existing exercises with subcategories based on muscle groups
-- This is a one-time migration to populate existing data

-- Chest exercises
UPDATE exercises 
SET subcategory = 'Chest' 
WHERE muscle_groups && ARRAY['chest', 'pectorals'] 
   OR name ILIKE '%bench%' 
   OR name ILIKE '%press%' 
   OR name ILIKE '%fly%'
   OR name ILIKE '%dip%'
   OR name ILIKE '%push%';

-- Back exercises  
UPDATE exercises 
SET subcategory = 'Back' 
WHERE muscle_groups && ARRAY['back', 'lats', 'rhomboids', 'traps'] 
   OR name ILIKE '%row%' 
   OR name ILIKE '%pull%' 
   OR name ILIKE '%deadlift%'
   OR name ILIKE '%lat%';

-- Legs exercises
UPDATE exercises 
SET subcategory = 'Legs' 
WHERE muscle_groups && ARRAY['quadriceps', 'hamstrings', 'glutes', 'calves'] 
   OR name ILIKE '%squat%' 
   OR name ILIKE '%lunge%' 
   OR name ILIKE '%leg%'
   OR name ILIKE '%calf%'
   OR name ILIKE '%thrust%';

-- Shoulders exercises
UPDATE exercises 
SET subcategory = 'Shoulders' 
WHERE muscle_groups && ARRAY['shoulders', 'delts', 'deltoids'] 
   OR name ILIKE '%press%' 
   OR name ILIKE '%raise%' 
   OR name ILIKE '%lateral%'
   OR name ILIKE '%overhead%';

-- Arms exercises
UPDATE exercises 
SET subcategory = 'Arms' 
WHERE muscle_groups && ARRAY['biceps', 'triceps', 'forearms'] 
   OR name ILIKE '%curl%' 
   OR name ILIKE '%extension%' 
   OR name ILIKE '%bicep%'
   OR name ILIKE '%tricep%';

-- Core exercises
UPDATE exercises 
SET subcategory = 'Core' 
WHERE muscle_groups && ARRAY['core', 'abs', 'obliques'] 
   OR name ILIKE '%plank%' 
   OR name ILIKE '%crunch%' 
   OR name ILIKE '%sit%'
   OR name ILIKE '%ab%'
   OR name ILIKE '%hollow%';

-- Cardio exercises
UPDATE exercises 
SET subcategory = 'Endurance' 
WHERE category_id IN (
  SELECT id FROM exercise_categories WHERE name ILIKE '%cardio%'
);

-- HIIT exercises
UPDATE exercises 
SET subcategory = 'Intervals' 
WHERE category_id IN (
  SELECT id FROM exercise_categories WHERE name ILIKE '%hiit%'
);

-- Bodyweight exercises
UPDATE exercises 
SET subcategory = 'Bodyweight' 
WHERE category_id IN (
  SELECT id FROM exercise_categories WHERE name ILIKE '%bodyweight%'
);

-- Flexibility exercises
UPDATE exercises 
SET subcategory = 'Flexibility' 
WHERE category_id IN (
  SELECT id FROM exercise_categories WHERE name ILIKE '%flexibility%'
);

-- Set default subcategory for any remaining exercises
UPDATE exercises 
SET subcategory = 'Other' 
WHERE subcategory IS NULL;
