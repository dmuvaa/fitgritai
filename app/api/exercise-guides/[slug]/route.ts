// app/api/exercise-guides/[slug]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase-utils';
import {
  demoGuides,
  buildGuideMediaPublicUrl,
  type GuideMedia,
  type GuideMediaType,
} from '@/lib/exercise-guides';

const DETAIL_SELECT = `
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
  media:exercise_guide_media(order_index, media_type, storage_path, thumbnail_url, label),
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

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Missing guide slug' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      const guide = demoGuides.find((item) => item.slug === slug);
      if (!guide) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }
      return NextResponse.json({ guide });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('exercise_guides')
      .select(DETAIL_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .order('order_index', { foreignTable: 'exercise_guide_media', ascending: true })
      .order('order_index', { foreignTable: 'exercise_guide_steps', ascending: true })
      .maybeSingle();

    if (error) {
      console.error('❌ [GUIDES] detail fetch failed', error);
      return NextResponse.json({ error: 'Failed to load guide' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const mappedMedia: GuideMedia[] = (data.media || []).map((media: any) => ({
      ...media,
      url: media.storage_path ? buildGuideMediaPublicUrl(media.storage_path) : null,
    }));

    if (mappedMedia.length === 0 && data.cover_media_path) {
      mappedMedia.push({
        id: `${data.id}-cover`,
        order_index: 0,
        media_type: inferMediaType(data.cover_media_path),
        storage_path: data.cover_media_path,
        url: buildGuideMediaPublicUrl(data.cover_media_path),
        thumbnail_url: data.thumbnail_url ?? null,
        label: 'Guide preview',
      });
    }

    const payload = {
      guide: {
        ...data,
        cover_media_url: buildGuideMediaPublicUrl(data.cover_media_path),
        media: mappedMedia,
      },
    };

    const response = NextResponse.json(payload);
    response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('❌ [GUIDES] detail unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

