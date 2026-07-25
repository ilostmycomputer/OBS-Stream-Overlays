# Overlay Showcase Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean GitHub Pages card-grid showcase for the repository's finished OBS overlays and tools, with live previews or safe demos and one `View on GitHub` link directly under each preview.

**Architecture:** A root `index.html` provides the GitHub Pages entry point and card structure. `showcase/showcase.css` owns all gallery styling, while `showcase/showcase.js` owns only showcase interactions such as switching countdown variants and replaying preview-only demos. Real self-contained overlays are embedded directly from their existing production files; dependency-heavy features use isolated fake-data demos under `showcase/demos/` so production files remain unchanged.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, iframe previews, Node.js built-in `node:test` for repository-level static verification, GitHub Pages.

## Global Constraints

- The page is a showcase only; no setup instructions, install steps, changelog, pricing, blog, stats, marketing copy, or unrelated repository information.
- Finished projects only.
- Dark neutral background, OpenAI Sans where available, system sans-serif fallback.
- Two cards per row on normal desktop widths; one card per row on narrow/mobile widths.
- Every card order is: project name, preview/demo, `View on GitHub` link directly below the preview, one short description.
- No site navigation, documentation section, marketing section, or footer content.
- Production overlay/tool files must not be changed just to support the showcase.
- No API keys, tokens, OBS WebSocket credentials, Discord credentials, or private service data may appear in the showcase.
- Start Stream Countdown preview uses the approved production light/dark HTML files.
- Discord Typing Alert uses fake showcase data only and never connects to the local bridge.
- Five-click Cursor Zoom is presented as a visual demonstration, not a live executable tool.

---

## File Structure

- Create `index.html` — GitHub Pages entry point, intro copy, five showcase cards, preview iframes, GitHub links.
- Create `showcase/showcase.css` — responsive layout, card styling, preview framing, controls, typography, demo styling.
- Create `showcase/showcase.js` — countdown light/dark switching, preview reloading where required, safe demo initialization.
- Create `showcase/demos/discord-typing.html` — dependency-free fake typing-alert animation using non-sensitive placeholder data.
- Create `showcase/demos/five-click-zoom.html` — dependency-free visual explanation of the five-click cursor-following zoom behaviour.
- Create `showcase/showcase.test.mjs` — Node built-in tests for page structure, required links, production-file references, and absence of forbidden content.

---

### Task 1: Build the gallery shell and structural tests

**Files:**
- Create: `index.html`
- Create: `showcase/showcase.css`
- Create: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes: existing repository file paths from the approved design spec.
- Produces: five `.showcase-card` sections with stable `data-showcase` identifiers: `countdown`, `confetti`, `subscriber-gradient`, `discord-typing`, `five-click-zoom`.

- [ ] **Step 1: Write the failing structural test**

Create `showcase/showcase.test.mjs` with Node built-ins only:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

const REQUIRED_SHOWCASES = [
  "countdown",
  "confetti",
  "subscriber-gradient",
  "discord-typing",
  "five-click-zoom",
];

test("homepage explains the showcase and GitHub links", () => {
  assert.match(html, /OBS Stream Overlays/);
  assert.match(html, /showcase/i);
  assert.match(html, /View on GitHub/);
});

test("homepage contains exactly the five approved showcase cards", () => {
  for (const id of REQUIRED_SHOWCASES) {
    assert.match(html, new RegExp(`data-showcase=["']${id}["']`));
  }

  const matches = html.match(/class=["'][^"']*showcase-card[^"']*["']/g) ?? [];
  assert.equal(matches.length, 5);
});

test("homepage omits navigation, footer, and setup content", () => {
  assert.doesNotMatch(html, /<nav\b/i);
  assert.doesNotMatch(html, /<footer\b/i);
  assert.doesNotMatch(html, /installation|setup guide|pricing|changelog/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL because `index.html` does not exist yet.

- [ ] **Step 3: Create the minimal gallery shell**

Create `index.html` with this semantic structure:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OBS Stream Overlays</title>
  <meta name="description" content="A showcase of finished OBS overlays and streaming tools.">
  <link rel="stylesheet" href="./showcase/showcase.css">
</head>
<body>
  <main class="page-shell">
    <header class="showcase-intro">
      <h1>OBS Stream Overlays</h1>
      <p>A showcase of finished OBS overlays and tools. Watch each preview here, then use View on GitHub to open the relevant source file or folder.</p>
    </header>

    <section class="showcase-grid" aria-label="Finished projects">
      <article class="showcase-card" data-showcase="countdown"></article>
      <article class="showcase-card" data-showcase="confetti"></article>
      <article class="showcase-card" data-showcase="subscriber-gradient"></article>
      <article class="showcase-card" data-showcase="discord-typing"></article>
      <article class="showcase-card" data-showcase="five-click-zoom"></article>
    </section>
  </main>

  <script src="./showcase/showcase.js" defer></script>
</body>
</html>
```

Create `showcase/showcase.css` with only the baseline variables and layout required for the shell:

```css
:root {
  color-scheme: dark;
  font-family: "OpenAI Sans", ui-sans-serif, system-ui, sans-serif;
  background: #0b0b0d;
  color: #f5f5f5;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-width: 320px;
  background: #0b0b0d;
}

.page-shell {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 72px 0 88px;
}

.showcase-intro {
  max-width: 720px;
  margin-bottom: 36px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.showcase-card {
  min-width: 0;
  border: 1px solid #242428;
  border-radius: 20px;
  background: #111114;
}

@media (max-width: 760px) {
  .page-shell {
    width: min(100% - 24px, 680px);
    padding-top: 44px;
  }

  .showcase-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run the structural test**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS for all Task 1 tests.

- [ ] **Step 5: Commit the shell**

```bash
git add index.html showcase/showcase.css showcase/showcase.test.mjs
git commit -m "Add showcase gallery shell"
```

---

### Task 2: Add real production previews and GitHub links

**Files:**
- Modify: `index.html`
- Modify: `showcase/showcase.js`
- Modify: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes: production files:
  - `Overlays & Plugins/overlays/countdown/stream-countdown.html`
  - `Overlays & Plugins/overlays/countdown/stream-countdown-dark.html`
  - `Overlays & Plugins/overlays/confetti/confetti.html`
  - `Overlays & Plugins/overlays/gradient-stroke/gradient.html`
- Produces: `setCountdownVariant(variant)` in `showcase/showcase.js`, accepting `"light" | "dark"` and updating only the countdown preview iframe source and toggle state.

- [ ] **Step 1: Extend tests for production preview paths and exact GitHub targets**

Append to `showcase/showcase.test.mjs`:

```js
const EXPECTED_PREVIEWS = [
  "Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  "Overlays%20%26%20Plugins/overlays/confetti/confetti.html",
  "Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html",
];

const EXPECTED_GITHUB_TARGETS = [
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/countdown",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/confetti/confetti.html",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/typing-notifications",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom",
];

test("self-contained overlays use the real production files", () => {
  for (const path of EXPECTED_PREVIEWS) assert.match(html, new RegExp(path));
});

test("every showcase links to the approved GitHub file or folder", () => {
  for (const href of EXPECTED_GITHUB_TARGETS) assert.match(html, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL because the cards do not yet contain preview paths or GitHub targets.

- [ ] **Step 3: Populate the countdown, confetti, and gradient cards**

Use the same card order for each card: heading, preview, GitHub link, description.

Countdown card:

```html
<article class="showcase-card" data-showcase="countdown">
  <h2>Start Stream Countdown</h2>
  <div class="preview-frame preview-frame--countdown">
    <div class="preview-switch" role="group" aria-label="Countdown style">
      <button type="button" class="is-active" data-countdown-variant="light">Light</button>
      <button type="button" data-countdown-variant="dark">Dark</button>
    </div>
    <iframe
      id="countdown-preview"
      title="Start Stream Countdown preview"
      src="./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html"
      loading="eager">
    </iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/countdown">View on GitHub</a>
  <p>A clean start-of-stream timer with rolling digits, perimeter sweep, and matching light and dark variants.</p>
</article>
```

Confetti card:

```html
<article class="showcase-card" data-showcase="confetti">
  <h2>Confetti</h2>
  <div class="preview-frame preview-frame--wide">
    <iframe title="Confetti preview" src="./Overlays%20%26%20Plugins/overlays/confetti/confetti.html" loading="lazy"></iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/confetti/confetti.html">View on GitHub</a>
  <p>A transparent celebration overlay that fills the scene with falling confetti.</p>
</article>
```

Subscriber Gradient card:

```html
<article class="showcase-card" data-showcase="subscriber-gradient">
  <h2>Subscriber Gradient</h2>
  <div class="preview-frame preview-frame--wide">
    <iframe title="Subscriber Gradient preview" src="./Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html" loading="lazy"></iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html">View on GitHub</a>
  <p>An animated colour source designed to drive a moving stroke around a live subscriber count.</p>
</article>
```

- [ ] **Step 4: Implement the countdown variant switch**

Create `showcase/showcase.js`:

```js
const countdownPreview = document.querySelector("#countdown-preview");
const countdownButtons = [...document.querySelectorAll("[data-countdown-variant]")];

const COUNTDOWN_SOURCES = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html",
};

function setCountdownVariant(variant) {
  const source = COUNTDOWN_SOURCES[variant];
  if (!countdownPreview || !source) return;

  countdownPreview.src = source;
  for (const button of countdownButtons) {
    const active = button.dataset.countdownVariant === variant;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

for (const button of countdownButtons) {
  button.addEventListener("click", () => setCountdownVariant(button.dataset.countdownVariant));
}
```

- [ ] **Step 5: Run tests and verify pass**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit production previews**

```bash
git add index.html showcase/showcase.js showcase/showcase.test.mjs
git commit -m "Add live overlay previews to showcase"
```

---

### Task 3: Add isolated Discord and five-click demos

**Files:**
- Create: `showcase/demos/discord-typing.html`
- Create: `showcase/demos/five-click-zoom.html`
- Modify: `index.html`
- Modify: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes: no production runtime dependencies.
- Produces: two static demo pages that can be embedded as iframes and contain no network/WebSocket/API calls.

- [ ] **Step 1: Add tests proving demo isolation**

Append to `showcase/showcase.test.mjs`:

```js
const discordDemo = await readFile(new URL("./demos/discord-typing.html", import.meta.url), "utf8").catch(() => "");
const zoomDemo = await readFile(new URL("./demos/five-click-zoom.html", import.meta.url), "utf8").catch(() => "");

test("showcase uses isolated demo pages for dependency-heavy tools", () => {
  assert.match(html, /showcase\/demos\/discord-typing\.html/);
  assert.match(html, /showcase\/demos\/five-click-zoom\.html/);
});

test("Discord showcase demo does not connect to external or local services", () => {
  assert.doesNotMatch(discordDemo, /WebSocket|ws:\/\/|wss:\/\/|fetch\(|XMLHttpRequest|discord\.com/i);
  assert.match(discordDemo, /Test User|is typing/i);
});

test("five-click demo is visual-only", () => {
  assert.doesNotMatch(zoomDemo, /obs-websocket|WebSocket|ws:\/\/|wss:\/\//i);
  assert.match(zoomDemo, /five|5/i);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL because the demo files and iframe references do not exist.

- [ ] **Step 3: Create the fake Discord typing demo**

Create `showcase/demos/discord-typing.html` as a self-contained visual loop:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; }
    .alert { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 18px; background: rgba(16, 16, 19, .94); color: white; box-shadow: 0 18px 48px rgba(0,0,0,.34); animation: demo 5s ease-in-out infinite; }
    .avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #2b2b31; font-weight: 700; }
    .name { font-weight: 700; }
    .status { opacity: .7; }
    @keyframes demo { 0%, 15%, 85%, 100% { opacity: 0; transform: translateY(-18px); } 25%, 75% { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="alert" aria-label="Typing notification demo">
    <div class="avatar" aria-hidden="true">TU</div>
    <div><div class="name">Test User</div><div class="status">is typing...</div></div>
  </div>
</body>
</html>
```

- [ ] **Step 4: Create the five-click zoom demo**

Create `showcase/demos/five-click-zoom.html` as a visual-only loop that shows five click pulses followed by a smooth zoom and cursor tracking. Keep all state local to the iframe and make no OBS or WebSocket calls.

Required DOM contract:

```html
<div class="demo" aria-label="Five-click cursor zoom demonstration">
  <div class="scene">
    <div class="scene-content">OBS PREVIEW</div>
    <div class="cursor" aria-hidden="true"></div>
    <div class="clicks" aria-hidden="true"></div>
  </div>
  <div class="label">5 rapid clicks → smooth cursor-following zoom</div>
</div>
```

Required animation sequence:

```js
const scene = document.querySelector(".scene");
const cursor = document.querySelector(".cursor");
const clicks = document.querySelector(".clicks");

async function runDemo() {
  scene.classList.remove("is-zoomed");
  clicks.replaceChildren();

  for (let i = 0; i < 5; i += 1) {
    const pulse = document.createElement("span");
    pulse.className = "click-pulse";
    clicks.append(pulse);
    await new Promise(resolve => setTimeout(resolve, 120));
  }

  scene.classList.add("is-zoomed");
  cursor.classList.add("is-following");
  await new Promise(resolve => setTimeout(resolve, 2600));
  cursor.classList.remove("is-following");
  await new Promise(resolve => setTimeout(resolve, 700));
  runDemo();
}

runDemo();
```

CSS must use `transform` transitions only for the zoom and cursor motion; no canvas/video dependency is needed.

- [ ] **Step 5: Add both demo cards to `index.html`**

Discord card:

```html
<article class="showcase-card" data-showcase="discord-typing">
  <h2>Discord Typing Alert</h2>
  <div class="preview-frame preview-frame--wide">
    <iframe title="Discord Typing Alert demo" src="./showcase/demos/discord-typing.html" loading="lazy"></iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/typing-notifications">View on GitHub</a>
  <p>A stream alert that shows who is typing in a watched Discord channel.</p>
</article>
```

Five-click card:

```html
<article class="showcase-card" data-showcase="five-click-zoom">
  <h2>Five-click Cursor Zoom</h2>
  <div class="preview-frame preview-frame--wide">
    <iframe title="Five-click Cursor Zoom demo" src="./showcase/demos/five-click-zoom.html" loading="lazy"></iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom">View on GitHub</a>
  <p>A helper that triggers a smooth cursor-following OBS zoom after five rapid clicks.</p>
</article>
```

- [ ] **Step 6: Run tests and verify pass**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit isolated demos**

```bash
git add index.html showcase/demos/discord-typing.html showcase/demos/five-click-zoom.html showcase/showcase.test.mjs
git commit -m "Add safe showcase demos"
```

---

### Task 4: Apply final card-grid presentation and preview framing

**Files:**
- Modify: `showcase/showcase.css`
- Modify: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes: the card/class names created in Tasks 1–3.
- Produces: final responsive appearance with no external styling dependency.

- [ ] **Step 1: Add CSS contract tests**

Append to `showcase/showcase.test.mjs`:

```js
const css = await readFile(new URL("./showcase.css", import.meta.url), "utf8");

test("gallery CSS has desktop two-column and mobile one-column layouts", () => {
  assert.match(css, /grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media[^}]*max-width:\s*760px/s);
  assert.match(css, /grid-template-columns:\s*1fr/);
});

test("preview links have a dedicated presentation class", () => {
  assert.match(css, /\.github-link\b/);
  assert.match(css, /\.preview-frame\b/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL until the final preview/link styles are added.

- [ ] **Step 3: Finish the visual system in `showcase/showcase.css`**

Add the final gallery styling using restrained dark neutrals and no decorative animation on the page shell:

```css
.showcase-intro h1 {
  margin: 0 0 12px;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  line-height: .98;
  letter-spacing: -.045em;
}

.showcase-intro p {
  margin: 0;
  max-width: 660px;
  color: #a9a9b2;
  font-size: 1rem;
  line-height: 1.6;
}

.showcase-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.showcase-card h2 {
  margin: 0 0 16px;
  font-size: 1.1rem;
}

.showcase-card p {
  margin: 14px 0 0;
  color: #a9a9b2;
  line-height: 1.55;
}

.preview-frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid #29292f;
  border-radius: 14px;
  background: #08080a;
}

.preview-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}

.preview-frame--countdown {
  aspect-ratio: 700 / 180;
}

.preview-frame--wide {
  aspect-ratio: 16 / 9;
  min-height: 220px;
}

.github-link {
  align-self: flex-start;
  margin-top: 12px;
  color: #f5f5f5;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

.preview-switch {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .62);
  backdrop-filter: blur(8px);
}

.preview-switch button {
  border: 0;
  border-radius: 7px;
  padding: 6px 9px;
  background: transparent;
  color: #aaaab2;
  font: inherit;
  cursor: pointer;
}

.preview-switch button.is-active {
  background: #f2f2f2;
  color: #111;
}
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit final styling**

```bash
git add showcase/showcase.css showcase/showcase.test.mjs
git commit -m "Polish showcase card grid"
```

---

### Task 5: Final GitHub Pages verification

**Files:**
- Verify: `index.html`
- Verify: `showcase/showcase.css`
- Verify: `showcase/showcase.js`
- Verify: `showcase/demos/discord-typing.html`
- Verify: `showcase/demos/five-click-zoom.html`
- Verify: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes: completed gallery implementation.
- Produces: verified static site ready for GitHub Pages root publishing.

- [ ] **Step 1: Run the full automated test suite**

Run:

```bash
node --test showcase/showcase.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Start a local static server**

Run from the repository root:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

- [ ] **Step 3: Verify desktop behaviour manually**

At a browser width above 760 px, confirm:

- page heading and short usage intro appear first;
- exactly five finished-project cards appear;
- grid is two columns;
- each card shows title → preview → `View on GitHub` → short description;
- countdown Light/Dark control swaps between the approved production files;
- confetti preview animates;
- subscriber gradient animates;
- Discord demo loops with fake `Test User` data and no browser console network/WebSocket errors;
- five-click demo visibly shows five click pulses followed by a smooth zoom.

- [ ] **Step 4: Verify mobile behaviour manually**

At a browser width at or below 760 px, confirm the card grid becomes one column and no iframe or text overflows horizontally.

- [ ] **Step 5: Verify all five GitHub links**

Open every `View on GitHub` link and confirm the destination is the intended file or folder on `main`:

```text
Overlays & Plugins/overlays/countdown/
Overlays & Plugins/overlays/confetti/confetti.html
Overlays & Plugins/overlays/gradient-stroke/gradient.html
Overlays & Plugins/overlays/typing-notifications/
Overlays & Plugins/tools/obs-five-click-cursor-zoom/
```

- [ ] **Step 6: Verify secrets are absent**

Run:

```bash
grep -RniE "api[_-]?key|token|password|wss?://127\.0\.0\.1|discord\.com/api" index.html showcase/
```

Expected: no matches from actual credentials or service connections. Text inside tests that explicitly checks forbidden patterns is acceptable and should be reviewed manually if grep reports it.

- [ ] **Step 7: Commit any verification-only corrections**

If verification required a correction, stage only showcase files and commit:

```bash
git add index.html showcase/
git commit -m "Finalize overlay showcase gallery"
```

If no corrections were required, do not create an empty commit.
