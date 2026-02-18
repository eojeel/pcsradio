# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

There is no build step. Serve the project root over HTTP (required for the YouTube IFrame API and service worker):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Architecture

This is a no-framework, vanilla JS single-page PWA. All logic lives in three files:

- **`index.html`** — static shell; contains the full DOM. The YouTube player target (`#yt-player`) is rendered here but kept off-screen via CSS.
- **`css/style.css`** — all styling via CSS custom properties at `:root`. Brand colours live here — edit `--teal` to change the accent colour throughout.
- **`js/app.js`** — all application logic. Bootstraps via the global `window.onYouTubeIframeAPIReady` callback invoked by the YouTube IFrame API script loaded in `index.html`.

### YouTube IFrame API flow

1. `https://www.youtube.com/iframe_api` script fires `window.onYouTubeIframeAPIReady` once loaded.
2. A hidden `YT.Player` is created targeting `#yt-player` with the initial genre's video ID.
3. Genre switches call `player.loadVideoById()` — this starts playback automatically.
4. Volume is controlled via `player.setVolume(0–100)`, not the HTML audio element.
5. Autoplay requires a prior user gesture; the play button satisfies this.

### Adding or changing a genre

Edit the `GENRES` object at the top of `js/app.js`:

```js
const GENRES = {
  lofi:      { name: 'Lofi',       videoId: 'jfKfPfyJRdk' },
  deephouse: { name: 'Deep House', videoId: 'D4MdHQOILdw' },
  synthwave: { name: 'Synthwave',  videoId: '4xDzrJKXOOY' },
  ambient:   { name: 'Ambient',    videoId: 'Y4u7D7xCvtw' },
};
```

Then add/update the corresponding `.preset` button in `index.html` with a matching `data-genre` attribute. Keyboard shortcut keys 1–4 map to `Object.keys(GENRES)` in order.

### Service worker

`sw.js` caches static assets on install (`CACHE_NAME = 'pcs-radio-v2'`). Bump the cache name when deploying changes to force clients to update. YouTube/external URLs bypass the cache entirely.

### Regenerating icons

Icons are generated with Python + Pillow. Run the generation script (previously used inline in the terminal) and target `icons/icon-192.png`, `icons/icon-512.png`, and `favicon.ico`. The accent colour used in the icons must be updated manually to match `--teal` in `style.css`.

## Brand

- Background: `#313131`, deep elements: `#1a1a1a`
- Accent: `#37b48f` — defined as `--teal` in CSS; this is the single variable to change for rebranding
- White text: `#ffffff`
