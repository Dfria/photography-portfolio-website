import { resolve } from 'path';
import { defineConfig } from 'vite';

// IMPORTANT for GitHub Pages:
// If your site is served from https://<user>.github.io/<repo>/ then `base`
// must be '/<repo>/'. If you use a custom domain or a <user>.github.io repo,
// set base to '/'.
//
// The deploy workflow sets the VITE_BASE env var automatically to '/<repo>/'.
// Locally it falls back to '/'.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        album: resolve(__dirname, 'album.html'),
      },
    },
  },
});
