# PokeDex Quiz

A Pokemon quiz PWA with offline support, built with React + Vite.

## Clearing Cache on iPad/iOS (for stale deploys)

When a new version is deployed, iPads with the old service worker may continue serving cached (outdated) files. The in-app Settings > "Clear Cache & Refresh" button handles this — but if the app is too broken to reach that button, use these manual steps.

### Option 1: Safari Console (Connect via Mac)

1. On iPad: **Settings > Safari > Advanced > Web Inspector** (enable it)
2. Connect iPad to Mac via USB
3. On Mac: open **Safari > Develop > [your iPad] > [the page]**
4. In the console, paste and run:

```js
// 1. Delete all caches
caches.keys().then(k => Promise.all(k.map(c => caches.delete(c)))).then(() => console.log('Caches cleared'));

// 2. Unregister all service workers
navigator.serviceWorker.getRegistrations().then(r => Promise.all(r.map(sw => sw.unregister()))).then(() => console.log('SW unregistered'));

// 3. Hard refresh
location.reload(true);
```

Or as a single one-liner:

```js
caches.keys().then(k=>Promise.all(k.map(c=>caches.delete(c)))).then(()=>navigator.serviceWorker.getRegistrations()).then(r=>Promise.all(r.map(sw=>sw.unregister()))).then(()=>location.reload(true));
```

### Option 2: Safari Settings (no Mac needed)

1. On iPad: **Settings > Safari > Clear History and Website Data**
   - This clears ALL site data (not just this app)
2. Re-open the app URL — it will download everything fresh

### Option 3: Per-site data (iOS 16+)

1. On iPad: **Settings > Safari > Advanced > Website Data**
2. Search for the domain hosting the app
3. Swipe left and tap **Delete**
4. Re-open the app URL

## Development

```bash
npm install
python3 scripts/download-sprites.py   # Download Pokemon sprites (first time only)
npm run dev       # Dev server at localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

## Pokemon Sprites

Images are self-hosted in two sizes:
- **`public/images/full/`** — 475x475 PNG (quiz/detail view). ~126MB, gitignored.
- **`public/images/thumb/`** — 128x128 PNG (browse grid, evo chain, score). ~17MB, committed.

Run `python3 scripts/download-sprites.py` to download full-size images. The script skips already-downloaded files, so re-running is safe. Requires Python 3 with Pillow (`pip install Pillow`).

To add new Pokemon (e.g. a new generation), update `TOTAL_POKEMON` in the script and re-run.

## Deployment Notes

- The service worker (`public/sw.js`) uses **cache-first** for all resources. After a new deploy, users must clear cache to get the new version.
- The app includes a **Settings > Clear Cache & Refresh** button for this purpose.
- If bumping the cache version in `sw.js` (e.g. `pokedex-quiz-v1` to `v2`), old caches are auto-deleted on SW activation. But the old SW must be replaced first, which requires the user to close all tabs or clear manually.
