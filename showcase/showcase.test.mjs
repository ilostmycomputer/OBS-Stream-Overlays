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
