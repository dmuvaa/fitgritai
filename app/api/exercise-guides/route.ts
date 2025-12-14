import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase-utils';
import {
  demoGuides,
  type ExerciseGuide,
  type GuideMedia,
  type GuideMediaType,
  type GuideListResponse,
  buildGuideMediaPublicUrl,
} from '@/lib/exercise-guides';

const BASE_SELECT = `
  id,
  slug,
  name,
  summary,
  primary_muscles,
  secondary_muscles,
  equipment_tags,
  thumbnail_url,
  cover_media_path,
  order_index,
  focus_area:exercise_focus_areas!inner(
    id,
    slug,
    name,
    description,
    region:exercise_regions!inner(
      id,
      slug,
      name,
      description
    )
  ),
  media:exercise_guide_media(order_index, media_type, storage_path, thumbnail_url, label)
`;

const SELECT_WITH_STEPS = `${BASE_SELECT},
  steps:exercise_guide_steps(order_index, title, description)
`;

const MEDIA_EXTENSION_MAP: Record<string, GuideMediaType> = {
  mp4: 'video',
  mov: 'video',
  webm: 'video',
  m4v: 'video',
  gif: 'gif',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  webp: 'image',
};

function inferMediaType(path: string): GuideMediaType {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return MEDIA_EXTENSION_MAP[ext] ?? 'image';
}

function applyInMemoryFilters(
  guides: ExerciseGuide[],
  { bodyPart, focusArea }: { bodyPart?: string; focusArea?: string },
) {
  return guides.filter((guide) => {
    if (bodyPart && guide.focus_area.region.slug !== bodyPart) return false;
    if (focusArea && guide.focus_area.slug !== focusArea) return false;
    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const bodyPart = searchParams.get('body_part') ?? undefined;
    const focusArea = searchParams.get('focus_area') ?? undefined;
    const includeSteps = searchParams.get('include_steps') !== 'false';
    const limit = Math.min(Number(searchParams.get('limit')) || 24, 100);

    if (!isSupabaseConfigured()) {
      const filtered = applyInMemoryFilters(demoGuides, { bodyPart, focusArea });
      const payload: GuideListResponse = {
        guides: filtered.slice(0, limit),
        meta: { total: filtered.length },
      };
      return NextResponse.json(payload);
    }

    const supabase = await createClient();
    let query = supabase
      .from('exercise_guides')
      .select(includeSteps ? SELECT_WITH_STEPS : BASE_SELECT)
      .eq('status', 'published')
      .order('order_index', { ascending: true })
      .limit(limit);

    const focusAreaIds: string[] = [];

    if (focusArea) {
      const { data, error } = await supabase
        .from('exercise_focus_areas')
        .select('id')
        .eq('slug', focusArea)
        .maybeSingle();

      if (error) {
        console.error('❌ [GUIDES] focus area lookup failed', error);
        return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
      }
      if (!data?.id) {
        return NextResponse.json({ guides: [], meta: { total: 0 } });
      }
      focusAreaIds.push(data.id);
    } else if (bodyPart) {
      const { data: region, error: regionError } = await supabase
        .from('exercise_regions')
        .select('id')
        .eq('slug', bodyPart)
        .maybeSingle();

      if (regionError) {
        console.error('❌ [GUIDES] body region lookup failed', regionError);
        return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
      }

      if (!region?.id) {
        return NextResponse.json({ guides: [], meta: { total: 0 } });
      }

      const { data: relatedFocusAreas, error: focusError } = await supabase
        .from('exercise_focus_areas')
        .select('id')
        .eq('region_id', region.id);

      if (focusError) {
        console.error('❌ [GUIDES] focus areas fetch failed', focusError);
        return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
      }

      relatedFocusAreas?.forEach((row) => {
        if (row.id) focusAreaIds.push(row.id);
      });
    }

    if (focusAreaIds.length > 0) {
      query = query.in('focus_area_id', focusAreaIds);
    }

    query = query.order('order_index', { foreignTable: 'exercise_guide_media', ascending: true });

    if (includeSteps) {
      query = query.order('order_index', {
        foreignTable: 'exercise_guide_steps',
        ascending: true,
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [GUIDES] fetch error', error);
      return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
    }

    const guides =
      data?.map((guide: any) => {
        const mappedMedia: GuideMedia[] = (guide.media || []).map((media: any) => ({
          ...media,
          url: media.storage_path ? buildGuideMediaPublicUrl(media.storage_path) : null,
        }));

        if (mappedMedia.length === 0 && guide.cover_media_path) {
          mappedMedia.push({
            id: `${guide.id}-cover`,
            order_index: 0,
            media_type: inferMediaType(guide.cover_media_path),
            storage_path: guide.cover_media_path,
            url: buildGuideMediaPublicUrl(guide.cover_media_path),
            thumbnail_url: guide.thumbnail_url ?? null,
            label: 'Guide preview',
          });
        }

        return {
          ...guide,
          cover_media_url: buildGuideMediaPublicUrl(guide.cover_media_path),
          media: mappedMedia,
        };
      }) ?? [];

    const payload: GuideListResponse = {
      guides,
      meta: { total: guides.length },
    };

    const response = NextResponse.json(payload);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('❌ [GUIDES] unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

