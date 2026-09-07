/**
 * optimize-images.js
 *
 * Resizes and compresses photos in public/albums/ IN PLACE so the site loads
 * fast on mobile and the repo stays small enough for GitHub.
 *
 *   - Max long edge: 2000px (plenty sharp for full-screen viewing)
 *   - JPEG quality: 82, progressive
 *   - Skips files that are already small (won't upscale or bloat)
 *   - Writes to a temp file first, then replaces the original only if the
 *     result is valid AND smaller. Your originals outside this project are
 *     never touched.
 *
 * Run:  npm run optimize
 *
 * IMPORTANT: This edits the copies inside the repo in place. Keep your
 * full-resolution originals somewhere outside this project folder.
 */

import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ALBUMS_DIR = join(__dirname, '..', 'public', 'albums');

const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;
const RASTER_EXTS = new Set(['.jpg', '.jpeg', '.png']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

async function optimizeFile(file) {
  const ext = extname(file).toLowerCase();
  if (!RASTER_EXTS.has(ext)) return null;

  const before = statSync(file).size;
  const tmp = file + '.opt-tmp' + ext;

  const image = sharp(file, { failOn: 'none' }).rotate(); // honor EXIF orientation
  const meta = await image.metadata();

  const pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true, // never upscale
  });

  if (ext === '.png') {
    // Keep PNGs as PNG (may contain transparency) but compress hard.
    await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmp);
  } else {
    await pipeline
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(tmp);
  }

  const after = statSync(tmp).size;

  // Only replace if the optimized version is actually smaller. Otherwise
  // discard it and leave the original alone.
  if (after < before) {
    unlinkSync(file);
    renameSync(tmp, file);
    return { file, before, after, dims: `${meta.width}x${meta.height}`, replaced: true };
  } else {
    unlinkSync(tmp);
    return { file, before, after: before, dims: `${meta.width}x${meta.height}`, replaced: false };
  }
}

async function main() {
  let files;
  try {
    files = walk(ALBUMS_DIR).filter((f) => RASTER_EXTS.has(extname(f).toLowerCase()));
  } catch {
    console.log('[optimize] No albums directory found.');
    return;
  }

  if (!files.length) {
    console.log('[optimize] No images to optimize.');
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let replaced = 0;

  for (const file of files) {
    try {
      const r = await optimizeFile(file);
      if (!r) continue;
      totalBefore += r.before;
      totalAfter += r.after;
      if (r.replaced) {
        replaced++;
        console.log(
          `  ${mb(r.before)}MB -> ${mb(r.after)}MB  (${r.dims})  ${file.replace(ALBUMS_DIR, '')}`
        );
      }
    } catch (err) {
      console.warn(`  ! skipped ${file}: ${err.message}`);
    }
  }

  console.log(
    `\n[optimize] Optimized ${replaced}/${files.length} file(s). ` +
      `Total ${mb(totalBefore)}MB -> ${mb(totalAfter)}MB ` +
      `(saved ${mb(totalBefore - totalAfter)}MB).`
  );
}

main();
