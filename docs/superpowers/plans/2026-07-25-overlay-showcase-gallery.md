# Overlay Showcase Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean GitHub Pages card-grid showcase for the repository's finished OBS overlays and tools, with live previews or safe demos and one `View on GitHub` link directly below each preview.

**Architecture:** A root `index.html` provides the page structure. `showcase/showcase.css` owns gallery styling and typography, `showcase/showcase.js` owns only showcase interactions, and `showcase/demos/` contains isolated visual demos for features that cannot run safely on GitHub Pages. Existing self-contained production overlays are embedded directly and remain unchanged.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, iframe previews, Node.js built-in `node:test`, GitHub Pages.

## Global Constraints

- Showcase only: no setup instructions, install steps, changelog, pricing, blog, stats, marketing copy, navigation, or footer content.
- Finished projects only.
- Dark neutral background.
- Use bundled OpenAI Sans for the gallery where available, with system sans-serif fallback.
- Two cards per row on normal desktop widths; one card per row at `760px` and below.
- Card order: project name → preview/demo → `View on GitHub` → one short description.
- Production overlay/tool files stay unchanged.
- No API keys, tokens, OBS WebSocket credentials, Discord credentials, or private service data.
- Countdown embeds the approved production light/dark files.
- Discord uses fake showcase data only.
- Five-click Cursor Zoom is clearly a visual demo, not a live executable tool.

---

## File Structure

- Create `index.html` — GitHub Pages entry point, intro copy, five cards and GitHub links.
- Create `showcase/showcase.css` — responsive card grid, preview framing, controls, bundled font loading.
- Create `showcase/showcase.js` — countdown Light/Dark switching only.
- Create `showcase/demos/discord-typing.html` — dependency-free fake typing-alert animation.
- Create `showcase/demos/five-click-zoom.html` — dependency-free visual five-click zoom demo.
- Create `showcase/showcase.test.mjs` — static structural and safety checks using Node built-ins.

---

### Task 1: Gallery shell and structural tests

**Files:**
- Create: `index.html`
- Create: `showcase/showcase.css`
- Create: `showcase/showcase.test.mjs`

**Interfaces:**
- Produces five `.showcase-card` elements with `data-showcase` values: `countdown`, `confetti`, `subscriber-gradient`, `discord-typing`, `five-click-zoom`.

- [ ] **Step 1: Write the failing structural test**

Create `showcase/showcase.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

const html = await read("../index.html").catch(() => "");

const REQUIRED_SHOWCASES = [
  "countdown",
  "confetti",
  "subscriber-gradient",
  "discord-typing",
  "five-click-zoom",
];

test("homepage explains the showcase and how to open source", () => {
  assert.match(html, /OBS Stream Overlays/);
  assert.match(html, /showcase/i);
  assert.match(html, /View on GitHub/);
});

test("homepage contains exactly five approved cards", () => {
  for (const id of REQUIRED_SHOWCASES) {
    assert.match(html, new RegExp(`data-showcase=["']${id}["']`));
  }
  assert.equal((html.match(/class=["'][^"']*showcase-card[^"']*["']/g) ?? []).length, 5);
});

test("homepage excludes non-showcase sections", () => {
  assert.doesNotMatch(html, /<nav\b/i);
  assert.doesNotMatch(html, /<footer\b/i);
  assert.doesNotMatch(html, /installation|setup guide|pricing|changelog/i);
});
```

- [ ] **Step 2: Verify the test fails**

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Create the semantic page shell**

Create `index.html`:

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

Create `showcase/showcase.css` with the initial grid and bundled fonts:

```css
@font-face {
  font-family: "OpenAI Sans";
  src: url("../Overlays%20%26%20Plugins/overlays/countdown/OpenAI-Sans-Medium.otf") format("opentype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "OpenAI Sans";
  src: url("../Overlays%20%26%20Plugins/overlays/countdown/OpenAI-Sans-Bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  color-scheme: dark;
  font-family: "OpenAI Sans", ui-sans-serif, system-ui, sans-serif;
  background: #0b0b0d;
  color: #f5f5f5;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: #0b0b0d; }
.page-shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0 88px; }
.showcase-intro { max-width: 720px; margin-bottom: 36px; }
.showcase-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.showcase-card { min-width: 0; border: 1px solid #242428; border-radius: 20px; background: #111114; }

@media (max-width: 760px) {
  .page-shell { width: min(100% - 24px, 680px); padding-top: 44px; }
  .showcase-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Verify Task 1 passes**

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS.

---

### Task 2: Real overlay previews, links, and countdown switch

**Files:**
- Modify: `index.html`
- Create: `showcase/showcase.js`
- Modify: `showcase/showcase.test.mjs`

**Interfaces:**
- Consumes existing production files:
  - `Overlays & Plugins/overlays/countdown/stream-countdown.html`
  - `Overlays & Plugins/overlays/countdown/stream-countdown-dark.html`
  - `Overlays & Plugins/overlays/confetti/confetti.html`
  - `Overlays & Plugins/overlays/gradient-stroke/gradient.html`
- Produces `setCountdownVariant(variant)` for `light` or `dark`.

- [ ] **Step 1: Add failing preview/link tests**

Append:

```js
const REQUIRED_LINKS = [
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/countdown",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/confetti/confetti.html",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/blob/main/Overlays%20%26%20Plugins/overlays/gradient-stroke/gradient.html",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/typing-notifications",
  "https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom",
];

test("real browser overlays reference production files", () => {
  assert.match(html, /stream-countdown\.html/);
  assert.match(html, /confetti\/confetti\.html/);
  assert.match(html, /gradient-stroke\/gradient\.html/);
});

test("all five approved GitHub targets are present", () => {
  for (const href of REQUIRED_LINKS) assert.ok(html.includes(href), href);
});
```

- [ ] **Step 2: Verify failure**

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Populate the three real-preview cards**

Countdown:

```html
<article class="showcase-card" data-showcase="countdown">
  <h2>Start Stream Countdown</h2>
  <div class="preview-frame preview-frame--countdown">
    <div class="preview-switch" role="group" aria-label="Countdown style">
      <button type="button" class="is-active" aria-pressed="true" data-countdown-variant="light">Light</button>
      <button type="button" aria-pressed="false" data-countdown-variant="dark">Dark</button>
    </div>
    <iframe id="countdown-preview" title="Start Stream Countdown preview" src="./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html"></iframe>
  </div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/countdown">View on GitHub</a>
  <p>A clean start-of-stream timer with rolling digits, perimeter sweep, and matching light and dark variants.</p>
</article>
```

Confetti:

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

Subscriber Gradient:

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

- [ ] **Step 4: Implement the countdown switch**

Create `showcase/showcase.js`:

```js
const preview = document.querySelector("#countdown-preview");
const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

const sources = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html",
};

function setCountdownVariant(variant) {
  if (!preview || !sources[variant]) return;
  preview.src = sources[variant];

  for (const button of buttons) {
    const active = button.dataset.countdownVariant === variant;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

for (const button of buttons) {
  button.addEventListener("click", () => setCountdownVariant(button.dataset.countdownVariant));
}
```

- [ ] **Step 5: Verify pass**

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS for Task 1–2 checks.

---

### Task 3: Safe Discord and five-click visual demos

**Files:**
- Create: `showcase/demos/discord-typing.html`
- Create: `showcase/demos/five-click-zoom.html`
- Modify: `index.html`
- Modify: `showcase/showcase.test.mjs`

**Interfaces:**
- Demo pages are standalone and make no network, WebSocket, Discord, or OBS connections.

- [ ] **Step 1: Add failing safety tests**

Append:

```js
const discordDemo = await read("./demos/discord-typing.html").catch(() => "");
const zoomDemo = await read("./demos/five-click-zoom.html").catch(() => "");

test("dependency-heavy projects use local showcase demos", () => {
  assert.match(html, /showcase\/demos\/discord-typing\.html/);
  assert.match(html, /showcase\/demos\/five-click-zoom\.html/);
});

test("Discord demo is fake-data only", () => {
  assert.doesNotMatch(discordDemo, /WebSocket|wss?:\/\/|fetch\(|XMLHttpRequest|discord\.com/i);
  assert.match(discordDemo, /Test User/);
  assert.match(discordDemo, /is typing/i);
});

test("five-click demo has no OBS connection", () => {
  assert.doesNotMatch(zoomDemo, /WebSocket|wss?:\/\/|obs-websocket/i);
  assert.match(zoomDemo, /5 rapid clicks/i);
});
```

- [ ] **Step 2: Verify failure**

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Create the Discord demo**

Create `showcase/demos/discord-typing.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow: hidden; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; }
.alert { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 18px; background: rgba(16,16,19,.96); color: white; box-shadow: 0 18px 48px rgba(0,0,0,.35); animation: demo 5s ease-in-out infinite; }
.avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #2b2b31; font-weight: 700; }
.name { font-weight: 700; }
.status { margin-top: 2px; opacity: .65; }
@keyframes demo { 0%, 12%, 88%, 100% { opacity: 0; transform: translateY(-20px); } 24%, 76% { opacity: 1; transform: translateY(0); } }
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

- [ ] **Step 4: Create the complete five-click demo**

Create `showcase/demos/five-click-zoom.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow: hidden; background: #09090b; color: #fff; font-family: ui-sans-serif, system-ui, sans-serif; }
.demo { width: min(92%, 560px); }
.viewport { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border: 1px solid #2a2a30; border-radius: 14px; background: #121216; }
.scene { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(circle at 30% 35%, #34343b, #141418 55%, #0d0d10); transform-origin: 56% 46%; transition: transform 620ms cubic-bezier(.22,1,.36,1); }
.scene::before { content: "OBS PREVIEW"; font-size: clamp(1rem, 4vw, 2rem); font-weight: 700; letter-spacing: .08em; opacity: .35; }
.scene.is-zoomed { transform: scale(2.15); }
.cursor { position: absolute; left: 56%; top: 46%; width: 16px; height: 22px; transform: translate(-2px, -2px) rotate(-22deg); clip-path: polygon(0 0, 100% 68%, 58% 72%, 43% 100%); background: #fff; filter: drop-shadow(0 2px 4px rgba(0,0,0,.55)); transition: left 760ms cubic-bezier(.22,1,.36,1), top 760ms cubic-bezier(.22,1,.36,1); }
.cursor.is-following { left: 68%; top: 58%; }
.clicks { position: absolute; left: 56%; top: 46%; }
.click-pulse { position: absolute; width: 18px; height: 18px; margin: -9px; border: 2px solid rgba(255,255,255,.8); border-radius: 50%; animation: pulse 500ms ease-out forwards; }
.label { margin-top: 12px; text-align: center; color: #aaaab2; font-size: .9rem; }
@keyframes pulse { from { opacity: 1; transform: scale(.3); } to { opacity: 0; transform: scale(2.4); } }
</style>
</head>
<body>
<div class="demo" aria-label="Five-click cursor zoom demonstration">
  <div class="viewport">
    <div class="scene"></div>
    <div class="cursor" aria-hidden="true"></div>
    <div class="clicks" aria-hidden="true"></div>
  </div>
  <div class="label">5 rapid clicks → smooth cursor-following zoom</div>
</div>
<script>
const scene = document.querySelector(".scene");
const cursor = document.querySelector(".cursor");
const clicks = document.querySelector(".clicks");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
  scene.classList.remove("is-zoomed");
  cursor.classList.remove("is-following");
  clicks.replaceChildren();
  await sleep(800);

  for (let i = 0; i < 5; i += 1) {
    const pulse = document.createElement("span");
    pulse.className = "click-pulse";
    clicks.append(pulse);
    await sleep(120);
  }

  scene.classList.add("is-zoomed");
  await sleep(350);
  cursor.classList.add("is-following");
  await sleep(2300);
  cursor.classList.remove("is-following");
  scene.classList.remove("is-zoomed");
  await sleep(900);
  runDemo();
}

runDemo();
</script>
</body>
</html>
```

- [ ] **Step 5: Add the two demo cards**

Discord:

```html
<article class="showcase-card" data-showcase="discord-typing">
  <h2>Discord Typing Alert</h2>
  <div class="preview-frame preview-frame--wide"><iframe title="Discord Typing Alert demo" src="./showcase/demos/discord-typing.html" loading="lazy"></iframe></div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/overlays/typing-notifications">View on GitHub</a>
  <p>A stream alert that shows who is typing in a watched Discord channel.</p>
</article>
```

Five-click:

```html
<article class="showcase-card" data-showcase="five-click-zoom">
  <h2>Five-click Cursor Zoom</h2>
  <div class="preview-frame preview-frame--wide"><iframe title="Five-click Cursor Zoom demo" src="./showcase/demos/five-click-zoom.html" loading="lazy"></iframe></div>
  <a class="github-link" href="https://github.com/ilostmycomputer/OBS-Stream-Overlays/tree/main/Overlays%20%26%20Plugins/tools/obs-five-click-cursor-zoom">View on GitHub</a>
  <p>A helper that triggers a smooth cursor-following OBS zoom after five rapid clicks.</p>
</article>
```

- [ ] **Step 6: Verify pass**

```bash
node --test showcase/showcase.test.mjs
```

Expected: PASS.

---

### Task 4: Final visual system and release verification

**Files:**
- Modify: `showcase/showcase.css`
- Modify: `showcase/showcase.test.mjs`
- Verify all showcase files.

**Interfaces:**
- Produces final responsive styling with no external CSS/JS dependencies.

- [ ] **Step 1: Add failing CSS contract tests**

Append:

```js
const css = await read("./showcase.css").catch(() => "");

test("gallery has two-column desktop and one-column mobile layout", () => {
  assert.match(css, /grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
});

test("gallery loads bundled OpenAI Sans and styles previews and GitHub links", () => {
  assert.match(css, /OpenAI-Sans-Medium\.otf/);
  assert.match(css, /OpenAI-Sans-Bold\.otf/);
  assert.match(css, /\.preview-frame\b/);
  assert.match(css, /\.github-link\b/);
});
```

- [ ] **Step 2: Verify failure**

```bash
node --test showcase/showcase.test.mjs
```

Expected: FAIL on missing final preview/link rules.

- [ ] **Step 3: Add final card presentation**

Append to `showcase/showcase.css`:

```css
.showcase-intro h1 { margin: 0 0 12px; font-size: clamp(2.4rem, 6vw, 4.6rem); line-height: .98; letter-spacing: -.045em; font-weight: 700; }
.showcase-intro p { margin: 0; max-width: 660px; color: #a9a9b2; font-size: 1rem; line-height: 1.6; }
.showcase-card { display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.showcase-card h2 { margin: 0 0 16px; font-size: 1.08rem; font-weight: 700; }
.showcase-card p { margin: 14px 0 0; color: #a9a9b2; line-height: 1.55; }
.preview-frame { position: relative; width: 100%; overflow: hidden; border: 1px solid #29292f; border-radius: 14px; background: #08080a; }
.preview-frame iframe { display: block; width: 100%; height: 100%; border: 0; background: transparent; }
.preview-frame--countdown { aspect-ratio: 700 / 180; }
.preview-frame--wide { aspect-ratio: 16 / 9; min-height: 220px; }
.github-link { align-self: flex-start; margin-top: 12px; color: #f5f5f5; text-decoration-thickness: 1px; text-underline-offset: 4px; }
.github-link:hover { opacity: .72; }
.preview-switch { position: absolute; z-index: 2; top: 10px; right: 10px; display: flex; gap: 4px; padding: 4px; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; background: rgba(0,0,0,.62); backdrop-filter: blur(8px); }
.preview-switch button { border: 0; border-radius: 7px; padding: 6px 9px; background: transparent; color: #aaaab2; font: inherit; cursor: pointer; }
.preview-switch button.is-active { background: #f2f2f2; color: #111; }
```

- [ ] **Step 4: Run automated verification**

```bash
node --test showcase/showcase.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Serve locally for visual review**

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` and confirm:

- intro explains what the page is and how `View on GitHub` works;
- exactly five cards;
- desktop two-column / mobile one-column layout;
- card order is title → preview → GitHub link → description;
- countdown Light/Dark switch loads the approved production files;
- confetti and gradient animate;
- Discord demo uses only fake `Test User` data;
- five-click demo shows five pulses, then zoom and cursor-follow motion;
- no unfinished projects appear.

- [ ] **Step 6: Check for accidental secrets/connections**

```bash
grep -RniE "api[_-]?key|token|password|wss?://127\.0\.0\.1|discord\.com/api" index.html showcase/
```

Expected: no real credentials or service connections. Matches inside test regexes are review-only and not runtime connections.

- [ ] **Step 7: Review before publishing**

Do not push the implementation to `main` until the user approves the locally rendered gallery. After approval, commit only `index.html` and `showcase/`, then verify the GitHub Pages deployment.
