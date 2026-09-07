import { asset, pageLink, loadManifest, esc } from './lib.js';
import { initLayout } from './layout.js';

initLayout('albums');

const container = document.getElementById('albums');

function albumCard(album) {
  const coverImg = album.cover
    ? `<img src="${esc(asset(album.cover))}" alt="${esc(album.title)}" loading="lazy" />`
    : '';

  const bits = [];
  if (album.counts.images) bits.push(`${album.counts.images} photo${album.counts.images === 1 ? '' : 's'}`);
  if (album.counts.videos) bits.push(`${album.counts.videos} video${album.counts.videos === 1 ? '' : 's'}`);
  if (album.date) bits.push(esc(album.date));

  const href = pageLink(`album.html?album=${encodeURIComponent(album.slug)}`);

  return `
    <a class="album-card" href="${href}">
      <div class="thumb">${coverImg}</div>
      <div class="body">
        <h3>${esc(album.title)}</h3>
        <div class="meta">${bits.map((b) => `<span>${b}</span>`).join('')}</div>
      </div>
    </a>`;
}

async function main() {
  try {
    const manifest = await loadManifest();
    if (!manifest.albums.length) {
      container.innerHTML = `
        <div class="state">
          No albums yet. Create a folder in
          <code>public/albums/your-shoot/</code>, drop in some photos, then run
          <code>npm run manifest</code>.
        </div>`;
      return;
    }
    container.innerHTML = manifest.albums.map(albumCard).join('');
  } catch (err) {
    container.innerHTML = `<div class="state">Could not load albums. ${esc(err.message)}</div>`;
  }
}

main();
