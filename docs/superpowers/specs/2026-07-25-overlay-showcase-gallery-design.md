# Overlay Showcase Gallery Design

## Goal

Create a clean GitHub Pages showcase for the finished projects in this repository. The page exists only to show what has been built and send visitors to the corresponding GitHub file or folder.

## Scope

The showcase is intentionally minimal:

- one responsive card grid;
- finished projects only;
- live preview or safe demo inside each card where practical;
- project name;
- one short description;
- one `View on GitHub` link placed directly below each preview;
- one short introductory paragraph explaining what the showcase is and how to use it;
- no setup instructions, install steps, changelog, pricing, blog, stats, marketing copy, or unrelated repository information.

The existing overlay and tool files remain the source of truth. The showcase must not alter their production behaviour just to make the gallery work.

## Visual direction

- Dark neutral background.
- OpenAI Sans where available, with a normal system sans-serif fallback.
- Spacious layout with restrained borders and no decorative clutter.
- Two cards per row on normal desktop widths.
- One card per row on narrow/mobile widths.
- Equal visual hierarchy across cards so the page feels like a portfolio rather than documentation.
- Motion should come primarily from the showcased projects themselves, not from unnecessary page animations.

## Cards

Every card follows the same content order:

1. project name;
2. live preview or safe visual demo;
3. `View on GitHub` link immediately below the preview;
4. one short description.

### Start Stream Countdown

Show the real start-stream countdown inside the card. The preview exposes both approved variants without duplicating the production files. A compact Light/Dark control switches between the existing light and dark HTML files.

GitHub link target: `Overlays & Plugins/overlays/countdown/`

### Confetti

Show the real confetti overlay in a contained preview. The preview may replay the effect internally so visitors can see the animation again, but there is no extra external action link beyond `View on GitHub`.

GitHub link target: `Overlays & Plugins/overlays/confetti/confetti.html`

### Subscriber Gradient

Show the animated gradient source directly because it is a self-contained visual effect.

GitHub link target: `Overlays & Plugins/overlays/gradient-stroke/gradient.html`

### Discord Typing Alert

The normal overlay depends on the local bridge and Vencord integration, so the public showcase must not require those dependencies. The card uses a safe visual demo with fake user data that reproduces the appearance of the finished alert without connecting to Discord or a local WebSocket bridge.

The production overlay remains unchanged.

GitHub link target: `Overlays & Plugins/overlays/typing-notifications/`

### Five-click Cursor Zoom

This is not a Browser Source, so its card uses a simple visual demonstration of the finished behaviour rather than pretending the real tool can execute in GitHub Pages. The demo communicates that five rapid clicks trigger a smooth cursor-following zoom.

GitHub link target: `Overlays & Plugins/tools/obs-five-click-cursor-zoom/`

## Page structure

The root page is a single showcase view:

1. Small page heading: `OBS Stream Overlays`.
2. Short neutral introduction explaining that this is a showcase of finished OBS overlays and tools, that previews can be watched directly on the page, and that `View on GitHub` opens the relevant source file or folder.
3. Responsive card grid containing only the finished projects above.

There is no site navigation, documentation section, marketing section, or footer content beyond the showcase itself.

## Architecture

- Root `index.html` is the GitHub Pages entry point.
- Showcase-specific styling lives in `showcase/showcase.css`.
- Showcase-specific interaction and demo logic lives in `showcase/showcase.js`.
- Existing repository HTML files are referenced directly for previews where they can run safely in a normal browser.
- Showcase-only demo logic is isolated from production overlay files.
- Links use canonical GitHub URLs so each card points directly to the relevant file or folder.

## Data flow

The showcase is static and has no backend.

- Browser loads `index.html` from GitHub Pages.
- Self-contained overlays render directly in embedded frames or preview containers.
- Showcase-only demos use local fake data only.
- `View on GitHub` links navigate visitors back to the repository.

No API keys, tokens, OBS WebSocket credentials, Discord credentials, or private service data are used by the showcase.

## Failure behaviour

- If an embedded preview fails to load, the card still shows its title, GitHub link, and description.
- Demo-only controls fail silently rather than blocking the rest of the page.
- The layout remains readable without JavaScript where possible.

## Verification

Before release:

- confirm GitHub Pages loads from the repository root;
- confirm the intro clearly explains what the showcase is and that `View on GitHub` opens the relevant source;
- confirm the grid is two columns on desktop and one column on narrow screens;
- confirm every card shows the intended finished project and no unfinished work;
- confirm each `View on GitHub` link is directly below its preview and points to the correct file or folder;
- confirm the countdown preview uses the approved production light/dark files without modifying them;
- confirm the confetti and subscriber-gradient previews animate correctly;
- confirm the Discord card uses fake showcase data and does not attempt a real bridge connection;
- confirm the five-click zoom card is clearly a demonstration rather than a live executable tool;
- confirm no secrets or private configuration are present in the published page.