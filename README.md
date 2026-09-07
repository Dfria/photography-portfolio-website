# Portfolio Website

A clean, static photo & video portfolio. Photos are organized into **albums**
(one folder per shoot). It deploys free on **GitHub Pages** and rebuilds
automatically whenever you push changes.

There is **no server and no login**. You add photos by dropping files into a
folder and pushing to GitHub. That's the whole workflow.

---

## What's here

```
public/albums/<album-name>/   ← one folder per shoot
  album.json                  ← optional: title, description, date, cover
  01-photo.jpg                ← your photos & videos
scripts/generate-manifest.js  ← scans albums and builds the gallery list
index.html                    ← home page (list of albums)
album.html                    ← album page (grid + lightbox viewer)
src/                          ← styles and page logic
.github/workflows/deploy.yml  ← auto-deploy to GitHub Pages
```

---

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 18 or newer). Then:

```bash
npm install      # one time, installs the build tool
npm run dev      # starts a local preview at http://localhost:5173
```

The dev server regenerates the album list automatically when it starts. Open
the printed URL in your browser.

To build the production version locally:

```bash
npm run build    # output goes into dist/
npm run preview  # preview the built version
```

---

## Add a new album (photoshoot)

1. Create a folder under `public/albums/`, e.g. `public/albums/beach-trip/`.
   The folder name becomes part of the URL, so use lowercase and dashes.
2. Drop your photos and videos into it.
   - Photos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`
   - Videos: `.mp4`, `.webm`, `.mov`, `.m4v`
   - Tip: prefix filenames with numbers (`01-`, `02-`) to control the order.
3. (Optional) Add an `album.json` in the folder to make it look nice:

   ```json
   {
     "title": "Beach Trip",
     "description": "A weekend by the coast.",
     "date": "2026-09-01",
     "cover": "01-sunrise.jpg"
   }
   ```

   Everything in `album.json` is optional. Without it, the title is derived
   from the folder name and the first photo becomes the cover.
4. Run `npm run dev` to preview, or just push (see below) to publish.

To **remove** an album, delete its folder. To **add more photos** to an
existing album, drop more files into that folder.

The two example albums (`golden-hour`, `studio-portraits`) contain placeholder
graphics. Delete those folders once you add real work.

---

## Publish it on GitHub Pages (first-time setup)

You'll do steps 1–4 once. After that, publishing is just "push".

### 1. Create a GitHub account and a repository
- Sign up at https://github.com if you haven't.
- Click **New repository**. Name it whatever you like (e.g. `portfolio`).
  Keep it **Public** so GitHub Pages is free. Don't add a README (you have one).

### 2. Upload this project to the repo
If you have Git installed, from this project folder:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Replace `<your-username>` and `<your-repo>` with your actual values.

> No Git? You can also use **GitHub Desktop** (a friendly app) or drag files
> into the repo on github.com via **Add file → Upload files**.

### 3. Turn on GitHub Pages
- In your repo on github.com, go to **Settings → Pages**.
- Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. The included workflow (`.github/workflows/deploy.yml`) builds the
site and deploys it.

### 4. Find your live URL
- Go to the **Actions** tab and wait for the "Deploy to GitHub Pages" run to
  finish (a green check).
- Your site will be live at:
  `https://<your-username>.github.io/<your-repo>/`

### From now on: publishing changes
Whenever you add or change albums:

```bash
git add .
git commit -m "Add beach-trip album"
git push
```

GitHub rebuilds and redeploys automatically within a minute or two.

---

## Notes & limits

- **Repo size:** GitHub repos work best under ~1 GB, with a 100 MB limit per
  file. That's plenty for a photo portfolio, but very large video files aren't
  a great fit. For heavy video, a media host (like Cloudinary) is a better
  long-term option — ask and this can be adapted.
- **Image size:** For fast loading, export web-friendly sizes (e.g. long edge
  ~2000px, JPEG quality ~80). Huge original files will load slowly.
- **Custom domain:** Possible via Settings → Pages. If you use one, set
  `base` to `'/'` in `vite.config.js`.
```
