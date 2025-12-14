// sync-guides-from-bucket.mjs
// Scans Supabase Storage "exercise-guides" and wires files to DB rows.
// FK on exercise_focus_areas is `region_id` (intentional typo per schema).

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'exercise-guides';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// --------------------------- Helpers ---------------------------

const MEDIA_EXT_MAP = {
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

function inferMediaType(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return MEDIA_EXT_MAP[ext] ?? 'image';
}

function titleCase(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isFile(obj) {
  return !!obj.name && !obj.metadata?.isDirectory;
}

function sortMediaFilenames(a, b) {
  // Stable order by filename for deterministic order_index
  const aa = a.name.toLowerCase();
  const bb = b.name.toLowerCase();
  if (aa < bb) return -1;
  if (aa > bb) return 1;
  return 0;
}

/**
 * Recursively list all items under a prefix (path), returning:
 * - folders: array of folder names (no trailing slash)
 * - files: array of file items { name, id, updated_at, created_at, metadata, ... }
 */
async function listPathRecursive(prefix = '') {
  const folders = [];
  const files = [];

  // Supabase Storage list is not recursive; walk manually
  let token = null;
  do {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
      token,
    });
    if (error) throw error;

    for (const entry of data) {
      if (entry.name.endsWith('/')) {
        // old style, but Supabase returns folders without metadata.isDirectory usually
        folders.push(entry.name.replace(/\/$/, ''));
      } else if (entry.metadata?.mimetype === 'application/octet-stream' && entry.name.endsWith('/')) {
        // ignore
      } else if (entry.metadata?.isDirectory) {
        folders.push(entry.name);
      } else if (entry.id && entry.name) {
        files.push({ ...entry, fullPath: prefix ? `${prefix}/${entry.name}` : entry.name });
      } else if (!entry.id && !entry.metadata) {
        // Directory entry (common case): no id/metadata => treat as folder
        folders.push(entry.name);
      } else {
        // File entry (common case): has id + name, no isDirectory
        files.push({ ...entry, fullPath: prefix ? `${prefix}/${entry.name}` : entry.name });
      }
    }

    token = null; // expo storage list doesn't always paginate; keep simple unless needed
  } while (token);

  // Dive into each discovered folder
  const childResults = await Promise.all(
    folders.map((folder) => listPathRecursive(prefix ? `${prefix}/${folder}` : folder))
  );

  for (const child of childResults) {
    files.push(...child.files);
  }

  return { folders, files };
}

/**
 * List direct children folders under a given prefix.
 * Used to identify region/focus/guide directories.
 */
async function listFolders(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;

  // Folders are entries without id/metadata
  return (data || [])
    .filter((e) => !e.id) // folder-like
    .map((e) => (prefix ? `${prefix}/${e.name}` : e.name));
}

/**
 * List files directly inside a prefix (non-recursive).
 */
async function listFiles(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;
  return (data || [])
    .filter((e) => !!e.id)
    .map((e) => ({ ...e, fullPath: prefix ? `${prefix}/${e.name}` : e.name }));
}

/**
 * Return all files under a guide path, including nested "videos/", "images/", etc.
 */
async function listGuideMediaFiles(guidePrefix) {
  // Get direct files
  const directFiles = await listFiles(guidePrefix);

  // And known subfolders (videos/images/gifs) if present
  const subfolders = ['videos', 'video', 'images', 'image', 'gifs', 'gif', 'media'];
  const foundFolders = [];

  const children = await listFolders(guidePrefix);
  for (const folderPath of children) {
    const folderName = folderPath.split('/').pop();
    if (subfolders.includes(folderName.toLowerCase())) {
      foundFolders.push(folderPath);
    }
  }

  const nestedFiles = [];
  for (const f of foundFolders) {
    const nested = await listFiles(f);
    nestedFiles.push(...nested);
  }

  // Merge and return
  return [...directFiles, ...nestedFiles];
}

// --------------------------- DB upserts ---------------------------

async function getOrCreateRegion(slug, orderIndex) {
  const { data: existing, error: selErr } = await supabase
    .from('exercise_regions')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const payload = {
    slug,
    name: titleCase(slug),
    order_index: orderIndex ?? 0,
  };

  const { data, error } = await supabase
    .from('exercise_regions')
    .insert([payload])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function getOrCreateFocus(regionId, slug, orderIndex) {
  // IMPORTANT: FK is region_id
  const { data: existing, error: selErr } = await supabase
    .from('exercise_focus_areas')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const payload = {
    region_id: regionId, // <- as requested
    slug,
    name: titleCase(slug),
    order_index: orderIndex ?? 0,
  };

  const { data, error } = await supabase
    .from('exercise_focus_areas')
    .insert([payload])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function getOrCreateGuide(focusAreaId, slug, orderIndex) {
  const { data: existing, error: selErr } = await supabase
    .from('exercise_guides')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const payload = {
    focus_area_id: focusAreaId,
    slug,
    name: titleCase(slug),
    status: 'published',
    order_index: orderIndex ?? 0,
  };

  const { data, error } = await supabase
    .from('exercise_guides')
    .insert([payload])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function replaceGuideMedia(guideId, mediaRows, coverMediaPath) {
  // Delete previous media for a clean resync
  const { error: delErr } = await supabase
    .from('exercise_guide_media')
    .delete()
    .eq('guide_id', guideId);
  if (delErr) throw delErr;

  if (mediaRows.length > 0) {
    const { error: insErr } = await supabase
      .from('exercise_guide_media')
      .insert(mediaRows);
    if (insErr) throw insErr;
  }

  // Update cover_media_path if provided
  if (coverMediaPath) {
    const { error: upErr } = await supabase
      .from('exercise_guides')
      .update({ cover_media_path: coverMediaPath })
      .eq('id', guideId);
    if (upErr) throw upErr;
  }
}

// --------------------------- Main ---------------------------

async function main() {
  console.log(`🔎 Scanning bucket: ${BUCKET}`);

  // Top-level: regions
  const regionFolders = await listFolders('');
  for (let rIdx = 0; rIdx < regionFolders.length; rIdx++) {
    const regionPath = regionFolders[rIdx]; // e.g. "chest"
    const regionSlug = regionPath.split('/').pop();
    const regionId = await getOrCreateRegion(regionSlug, rIdx + 1);
    console.log(`\n📁 Region: ${regionSlug} (id=${regionId})`);

    // Next-level: focus areas under region
    const focusFolders = await listFolders(regionPath);
    for (let fIdx = 0; fIdx < focusFolders.length; fIdx++) {
      const focusPath = focusFolders[fIdx]; // e.g. "chest/upper-chest"
      const focusSlug = focusPath.split('/').pop();
      const focusId = await getOrCreateFocus(regionId, focusSlug, fIdx + 1);
      console.log(`  📂 Focus: ${focusSlug} (id=${focusId})`);

      // Next-level: guides under focus
      const guideFolders = await listFolders(focusPath);
      for (let gIdx = 0; gIdx < guideFolders.length; gIdx++) {
        const guidePath = guideFolders[gIdx]; // e.g. "chest/upper-chest/incline-dumbbell-press"
        const guideSlug = guidePath.split('/').pop();
        const guideId = await getOrCreateGuide(focusId, guideSlug, gIdx + 1);
        process.stdout.write(`    🎯 Guide: ${guideSlug} (id=${guideId})\n`);

        // Gather media files inside guide (incl. known subfolders)
        const files = await listGuideMediaFiles(guidePath);

        // Filter obviously-not-media helpers (e.g., thumbs.db), keep common image/gif/video
        const mediaFiles = files.filter((f) => {
          const ext = f.name.split('.').pop()?.toLowerCase() || '';
          return !!MEDIA_EXT_MAP[ext];
        });

        mediaFiles.sort(sortMediaFilenames);

        const mediaRows = mediaFiles.map((f, idx) => {
          const storage_path = f.fullPath; // path relative to bucket
          const media_type = inferMediaType(storage_path);
          const baseLabel = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
          return {
            guide_id: guideId,
            order_index: idx + 1,
            media_type,
            storage_path,
            label: titleCase(baseLabel),
          };
        });

        // Pick a cover: prefer first video; otherwise first file
        const firstVideo = mediaRows.find((m) => m.media_type === 'video');
        const cover = (firstVideo?.storage_path) || (mediaRows[0]?.storage_path) || null;

        try {
          await replaceGuideMedia(guideId, mediaRows, cover);
          console.log(`      ✅ Synced ${mediaRows.length} media items`);
        } catch (e) {
          console.error('      ❌ Sync failed:', serializeError(e));
        }
      }
    }
  }

  console.log('\n✅ Done.');
}

function serializeError(e) {
  if (!e) return e;
  if (typeof e === 'string') return e;
  return {
    message: e.message,
    code: e.code ?? e.status,
    details: e.details ?? null,
    hint: e.hint ?? null,
  };
}

main().catch((e) => {
  console.error('❌ Unhandled error:', e);
  process.exit(1);
});
