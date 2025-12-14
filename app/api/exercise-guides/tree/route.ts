// app/api/exercise-guides/tree/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase-utils';
import { demoGuideTree, type GuideTreeResponse } from '@/lib/exercise-guides';

const TREE_SELECT = `
  id,
  slug,
  name,
  description,
  order_index,
  focus_areas:exercise_focus_areas(
    id,
    slug,
    name,
    description,
    order_index
  )
`;

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(demoGuideTree satisfies GuideTreeResponse);
    }

    const supabase = await createClient();
    const { data: regions, error } = await supabase
      .from('exercise_regions')
      .select(TREE_SELECT)
      .order('order_index', { ascending: true })
      .order('order_index', {
        foreignTable: 'exercise_focus_areas',
        ascending: true,
      });

    if (error) {
      console.error('❌ [GUIDES:TREE] regions fetch failed', error);
      return NextResponse.json({ error: 'Failed to load guide taxonomy' }, { status: 500 });
    }

    const { data: countsData, error: countError } = await supabase
      .from('exercise_guides')
      .select('focus_area_id')
      .eq('status', 'published');

    if (countError) {
      console.error('❌ [GUIDES:TREE] counts fetch failed', countError);
      return NextResponse.json({ error: 'Failed to load guide taxonomy' }, { status: 500 });
    }

    const counts = (countsData || []).reduce<Record<string, number>>((acc, row) => {
      if (row.focus_area_id) {
        acc[row.focus_area_id] = (acc[row.focus_area_id] || 0) + 1;
      }
      return acc;
    }, {});

    const payload: GuideTreeResponse = {
      bodyRegions:
        regions?.map((region: any) => ({
          id: region.id,
          slug: region.slug,
          name: region.name,
          description: region.description,
          order_index: region.order_index,
          focusAreas: (region.focus_areas || []).map((focusArea: any) => ({
            id: focusArea.id,
            slug: focusArea.slug,
            name: focusArea.name,
            description: focusArea.description,
            order_index: focusArea.order_index,
            guideCount: counts[focusArea.id] || 0,
          })),
        })) ?? [],
    };

    const response = NextResponse.json(payload);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('❌ [GUIDES:TREE] unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

