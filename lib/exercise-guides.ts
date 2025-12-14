/**
 * Shared exercise guide types + demo data
 */
// lib/exercise-guides.ts

export const GUIDE_MEDIA_BUCKET = 'exercise-guides';

export type GuideDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type GuideMediaType = 'image' | 'gif' | 'video';

export interface GuideMedia {
  id?: string;
  order_index?: number;
  media_type: GuideMediaType;
  storage_path?: string | null;
  url?: string | null;
  thumbnail_url?: string | null;
  label?: string | null;
}

export interface GuideStep {
  id?: string;
  order_index?: number;
  title: string;
  description: string;
}

export interface GuideRegion {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  hero_image_url?: string | null;
  accent_color?: string | null;
  order_index?: number | null;
  focusAreas: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    order_index?: number | null;
    guideCount: number;
  }>;
}

export interface ExerciseGuide {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  difficulty?: GuideDifficulty | null;
  equipment_tags: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  tags?: string[];
  order_index?: number | null;
  thumbnail_url?: string | null;
  cover_media_path?: string | null;
  cover_media_url?: string | null;
  focus_area: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    region: {
      id: string;
      slug: string;
      name: string;
      description?: string | null;
      accent_color?: string | null;
      hero_image_url?: string | null;
    };
  };
  media: GuideMedia[];
  steps?: GuideStep[];
}

export interface GuideListResponse {
  guides: ExerciseGuide[];
  meta: {
    total: number;
  };
}

export interface GuideTreeResponse {
  bodyRegions: GuideRegion[];
}

export const demoGuides: ExerciseGuide[] = [
  {
    id: 'demo-bench-press',
    slug: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    summary: 'Foundation compound lift to build mid and upper chest.',
    difficulty: 'intermediate',
    equipment_tags: ['barbell', 'flat bench'],
    primary_muscles: ['pectoralis major', 'triceps brachii'],
    secondary_muscles: ['anterior deltoid'],
    tags: ['compound', 'strength'],
    focus_area: {
      id: 'demo-mid-chest',
      slug: 'mid-chest',
      name: 'Mid Chest',
      description: 'Horizontal pressing builds the thick mid chest.',
      region: {
        id: 'demo-chest',
        slug: 'chest',
        name: 'Chest',
        description: 'Pressing patterns focused on the pectorals.',
        accent_color: '#f97316',
        hero_image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
      },
    },
    media: [
      {
        id: 'demo-bench-video',
        order_index: 1,
        media_type: 'video',
        url: 'https://storage.googleapis.com/fitgrit-demo/chest/bench-press/bench-press.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1200&q=80',
        label: 'Full rep demo',
      },
      {
        id: 'demo-bench-gif',
        order_index: 2,
        media_type: 'gif',
        url: 'https://storage.googleapis.com/fitgrit-demo/chest/bench-press/bench-press-loop.gif',
        label: 'Tempo loop',
      },
    ],
    steps: [
      {
        id: 'demo-bench-step-1',
        order_index: 1,
        title: 'Set your base',
        description: 'Dig your shoulder blades into the bench and drive feet into the floor.',
      },
      {
        id: 'demo-bench-step-2',
        order_index: 2,
        title: 'Control the descent',
        description: 'Lower to mid chest keeping elbows ~45° from your torso.',
      },
      {
        id: 'demo-bench-step-3',
        order_index: 3,
        title: 'Press explosively',
        description: 'Drive the bar up while keeping scapula pinned down.',
      },
    ],
  },
  {
    id: 'demo-incline-press',
    slug: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    summary: 'Independent dumbbell pressing to emphasize the clavicular chest.',
    difficulty: 'beginner',
    equipment_tags: ['adjustable bench', 'dumbbells'],
    primary_muscles: ['upper chest', 'anterior deltoid'],
    secondary_muscles: ['triceps brachii'],
    tags: ['hypertrophy', 'tempo'],
    focus_area: {
      id: 'demo-upper-chest',
      slug: 'upper-chest',
      name: 'Upper Chest',
      description: 'Incline press variations for clavicular fibers.',
      region: {
        id: 'demo-chest',
        slug: 'chest',
        name: 'Chest',
        description: 'Pressing patterns focused on the pectorals.',
        accent_color: '#f97316',
        hero_image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
      },
    },
    media: [
      {
        id: 'demo-incline-video',
        order_index: 1,
        media_type: 'video',
        url: 'https://storage.googleapis.com/fitgrit-demo/chest/incline-press/incline-press.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80',
        label: 'Incline press',
      },
      {
        id: 'demo-incline-image',
        order_index: 2,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1599058918147-89bff57bf20c?auto=format&fit=crop&w=1200&q=80',
        label: 'Top position',
      },
    ],
    steps: [
      {
        id: 'demo-incline-step-1',
        order_index: 1,
        title: 'Pack the shoulders',
        description: 'Angle bench 25–35° and lock shoulder blades down.',
      },
      {
        id: 'demo-incline-step-2',
        order_index: 2,
        title: 'Arc through midline',
        description: 'Lower bells in a slight arc until elbows reach 90°.',
      },
      {
        id: 'demo-incline-step-3',
        order_index: 3,
        title: 'Drive & squeeze',
        description: 'Press and meet bells over chest without clanking.',
      },
    ],
  },
  {
    id: 'demo-leg-extension',
    slug: 'leg-extension',
    name: 'Leg Extension',
    summary: 'Quad isolation finisher with brutal lockout tension.',
    difficulty: 'beginner',
    equipment_tags: ['leg extension machine'],
    primary_muscles: ['quadriceps'],
    secondary_muscles: ['rectus femoris'],
    tags: ['isolation', 'burnout'],
    focus_area: {
      id: 'demo-quads',
      slug: 'quads',
      name: 'Quadriceps',
      description: 'Knee-dominant patterns for the front of the legs.',
      region: {
        id: 'demo-legs',
        slug: 'legs',
        name: 'Legs',
        description: 'Quad, hamstring and glute development.',
        accent_color: '#8b5cf6',
        hero_image_url: 'https://images.unsplash.com/photo-1507537509458-b8312d35a233?auto=format&fit=crop&w=1600&q=80',
      },
    },
    media: [
      {
        id: 'demo-leg-ext-video',
        order_index: 1,
        media_type: 'video',
        url: 'https://storage.googleapis.com/fitgrit-demo/legs/leg-extension/leg-extension.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80',
        label: 'Isolation demo',
      },
    ],
    steps: [
      {
        id: 'demo-leg-ext-step-1',
        order_index: 1,
        title: 'Align the knee',
        description: 'Seat depth so knees line up with machine pivot.',
      },
      {
        id: 'demo-leg-ext-step-2',
        order_index: 2,
        title: 'Kick & squeeze',
        description: 'Extend until knees almost lock, pausing 1s at top.',
      },
      {
        id: 'demo-leg-ext-step-3',
        order_index: 3,
        title: 'Lower with control',
        description: 'Descend for 2s keeping constant quad tension.',
      },
    ],
  },
  {
    id: 'demo-bulgarian',
    slug: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    summary: 'Single-leg crusher for quads and glutes using limited equipment.',
    difficulty: 'intermediate',
    equipment_tags: ['bench', 'optional dumbbells'],
    primary_muscles: ['glute max', 'quadriceps'],
    secondary_muscles: ['adductors', 'core'],
    tags: ['unilateral', 'balance'],
    focus_area: {
      id: 'demo-glutes',
      slug: 'glutes-hamstrings',
      name: 'Glutes & Hamstrings',
      description: 'Hip hinge elements for posterior chain.',
      region: {
        id: 'demo-legs',
        slug: 'legs',
        name: 'Legs',
        description: 'Quad, hamstring and glute development.',
        accent_color: '#8b5cf6',
        hero_image_url: 'https://images.unsplash.com/photo-1507537509458-b8312d35a233?auto=format&fit=crop&w=1600&q=80',
      },
    },
    media: [
      {
        id: 'demo-bulgarian-video',
        order_index: 1,
        media_type: 'video',
        url: 'https://storage.googleapis.com/fitgrit-demo/legs/bulgarian-split-squat/bulgarian-split-squat.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda67f?auto=format&fit=crop&w=1200&q=80',
        label: 'Unilateral focus',
      },
    ],
    steps: [
      {
        id: 'demo-bulgarian-step-1',
        order_index: 1,
        title: 'Set your stance',
        description: 'Stand 2 feet in front of the bench with rear laces on the pad.',
      },
      {
        id: 'demo-bulgarian-step-2',
        order_index: 2,
        title: 'Drop straight down',
        description: 'Front shin vertical while back knee lowers toward floor.',
      },
      {
        id: 'demo-bulgarian-step-3',
        order_index: 3,
        title: 'Drive through front leg',
        description: 'Push floor away, finishing with strong glute squeeze.',
      },
    ],
  },
];

export const demoGuideTree: GuideTreeResponse = {
  bodyRegions: [
    {
      id: 'demo-chest',
      slug: 'chest',
      name: 'Chest',
      description: 'Pressing patterns focused on the pectorals.',
      hero_image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
      accent_color: '#f97316',
      order_index: 1,
      focusAreas: [
        {
          id: 'demo-upper-chest',
          slug: 'upper-chest',
          name: 'Upper Chest',
          description: 'Incline press variations for clavicular fibers.',
          order_index: 1,
          guideCount: demoGuides.filter((guide) => guide.focus_area.slug === 'upper-chest').length,
        },
        {
          id: 'demo-mid-chest',
          slug: 'mid-chest',
          name: 'Mid Chest',
          description: 'Horizontal pressing builds the thick mid chest.',
          order_index: 2,
          guideCount: demoGuides.filter((guide) => guide.focus_area.slug === 'mid-chest').length,
        },
      ],
    },
    {
      id: 'demo-legs',
      slug: 'legs',
      name: 'Legs',
      description: 'Quad, hamstring and glute development.',
      hero_image_url: 'https://images.unsplash.com/photo-1507537509458-b8312d35a233?auto=format&fit=crop&w=1600&q=80',
      accent_color: '#8b5cf6',
      order_index: 2,
      focusAreas: [
        {
          id: 'demo-quads',
          slug: 'quads',
          name: 'Quadriceps',
          description: 'Knee-dominant patterns for the front of the legs.',
          order_index: 1,
          guideCount: demoGuides.filter((guide) => guide.focus_area.slug === 'quads').length,
        },
        {
          id: 'demo-glutes',
          slug: 'glutes-hamstrings',
          name: 'Glutes & Hamstrings',
          description: 'Hip hinge elements for posterior chain.',
          order_index: 2,
          guideCount: demoGuides.filter((guide) => guide.focus_area.slug === 'glutes-hamstrings').length,
        },
      ],
    },
  ],
};

export function buildGuideMediaPublicUrl(path?: string | null) {
  if (!path) return null;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${baseUrl}/storage/v1/object/public/${GUIDE_MEDIA_BUCKET}/${encodedPath}`;
}

