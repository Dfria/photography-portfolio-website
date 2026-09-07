import { asset, loadManifest, getParam, esc } from './lib.js';

const grid = document.getElementById('media');
const titleEl = document.getElementById('album-title');
const descEl = document.getElementById('album-description');

const lightbox = document.getElementById('lightbox');
const lbContent = document.getElementById('lb-content');
const lbCaption = document.getElementById('lb-caption');

let media = [];
let currentIndex = 0;

function mediaItem(item, index) {
  const badge =
    item.type === 'video' ? `<span class="badge">Video</span>` : '';
  const inner =
    item.type === 'video'
      ? `<video src="${esc(asset(item.src))}" muted preload="metadata"></video>`
      : `<img src="${esc(asset(item.src))}" alt="${esc(item.alt)}" loading="lazy" />`;
  return `
    <figure class="media-item" data-index="${index}">
      ${badge}
      ${inner}
    </figure>`;
}

function renderLightbox() {
  const item = media[currentIndex];
  if (!item) return;
  lbContent.innerHTML =
    item.type === 'video'
      ? `<video src="${esc(asset(item.src))}" controls autoplay playsinline></video>`
      : `<img src="${esc(asset(item.src))}" alt="${esc(item.alt)}" />`;
  lbCaption.textContent = `${currentIndex + 1} / ${media.length}`;
}

function openLightbox(index) {
  currentIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lbContent.innerHTML = ''; // stop any playing video
  document.body.style.overflow = '';
}

function step(delta) {
  currentIndex = (currentIndex + delta + media.length) % media.length;
  renderLightbox();
}

function wireLightbox() {
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => step(-1));
  document.getElementById('lb-next').addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
}

async function main() {
  const slug = getParam('album');
  if (!slug) {
    grid.innerHTML = `<div class="state">No album specified.</div>`;
    return;
  }

  try {
    const manifest = await loadManifest();
    const album = manifest.albums.find((a) => a.slug === slug);
    if (!album) {
      titleEl.textContent = 'Album not found';
      grid.innerHTML = `<div class="state">That album doesn't exist.</div>`;
      return;
    }

    document.title = `${album.title} — Portfolio`;
    titleEl.textContent = album.title;
    descEl.textContent = album.description || '';

    media = album.media;
    if (!media.length) {
      grid.innerHTML = `<div class="state">This album has no media yet.</div>`;
      return;
    }

    grid.innerHTML = media.map(mediaItem).join('');
    grid.querySelectorAll('.media-item').forEach((el) => {
      el.addEventListener('click', () =>
        openLightbox(Number(el.dataset.index))
      );
    });

    wireLightbox();
  } catch (err) {
    grid.innerHTML = `<div class="state">Could not load this album. ${esc(err.message)}</div>`;
  }
}

main();
