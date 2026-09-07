/**
 * generate-manifest.js
 *
 * Scans public/albums/<album>/ folders and produces public/albums.json,
 * which the website reads to render galleries.
 *
 * How it works for you:
 *   1. Create a folder:  public/albums/my-shoot/
 *   2. Drop .jpg/.png/.webp/.gif and .mp4/.webm/.mov files into it.
 *   3. (Optional) Add an album.json in that folder to set a nice title,
 *      description, date, and cover image.
 *   4. Run `npm run manifest` (this happens automatically on build/dev).
 *
 * No file lists to maintain by hand. Add files, run, done.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ALBUMS_DIR = join(ROOT, 'public', 'albums');
const OUTPUT = join(ROOT, 'public', 'albums.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg']);

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/** Turn "beach-2024" into "Beach 2024" as a fallback title. */
function prettify(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function readAlbumMeta(albumPath) {
  const metaPath = join(albumPath, 'album.json');
  try {
    return JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch {
    return {};
  }
}

function classify(file) {
  const ext = extname(file).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (VIDEO_EXTS.has(ext)) return 'video';
  return null;
}

function buildAlbum(slug) {
  const albumPath = join(ALBUMS_DIR, slug);
  const meta = readAlbumMeta(albumPath);

  const entries = readdirSync(albumPath)
    .filter((name) => name.toLowerCase() !== 'album.json')
    .filter((name) => !name.startsWith('.'))
    .map((name) => ({ name, type: classify(name) }))
    .filter((item) => item.type !== null)
    // Sort by filename so ordering is predictable. Prefix files with
    // 01_, 02_ etc. if you want a specific order.
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const media = entries.map((item) => ({
    type: item.type,
    // Path is relative to the site root; `public/` is served at root by Vite.
    src: `albums/${slug}/${item.name}`,
    alt: item.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
  }));

  // Cover: explicit meta.cover if given, else the first image, else first item.
  let cover = null;
  if (meta.cover) {
    cover = `albums/${slug}/${meta.cover}`;
  } else {
    const firstImage = media.find((m) => m.type === 'image');
    cover = (firstImage || media[0])?.src || null;
  }

  const imageCount = media.filter((m) => m.type === 'image').length;
  const videoCount = media.filter((m) => m.type === 'video').length;

  return {
    slug,
    title: meta.title || prettify(slug),
    description: meta.description || '',
    date: meta.date || '',
    cover,
    counts: { images: imageCount, videos: videoCount, total: media.length },
    media,
  };
}

function main() {
  let albums = [];

  if (isDir(ALBUMS_DIR)) {
    const slugs = readdirSync(ALBUMS_DIR)
      .filter((name) => isDir(join(ALBUMS_DIR, name)))
      .filter((name) => !name.startsWith('.'));

    albums = slugs
      .map(buildAlbum)
      .filter((album) => album.media.length > 0);

    // Newest first when dates are present; otherwise alphabetical by title.
    albums.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return a.title.localeCompare(b.title);
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    albumCount: albums.length,
    albums,
  };

  writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
  console.log(
    `[manifest] Wrote ${albums.length} album(s) with ` +
      `${albums.reduce((n, a) => n + a.counts.total, 0)} media file(s) to public/albums.json`
  );
}

main();
