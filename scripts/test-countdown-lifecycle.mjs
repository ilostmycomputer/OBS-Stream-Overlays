import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const htmlPath = new URL("../overlays/countdown/summer-update-countdown.html", import.meta.url);
const html = fs.readFileSync(htmlPath, "utf8");
const scriptMatch = html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i);

assert.ok(scriptMatch, "Countdown HTML must contain an inline script.");

const script = scriptMatch[1];
const targetMatch = script.match(/const TARGET_DATE_TIME = "([^"]+)";/);

assert.ok(targetMatch, "Countdown script must expose TARGET_DATE_TIME as a quoted ISO date.");

const targetTime = Date.parse(targetMatch[1]);
assert.ok(Number.isFinite(targetTime), "TARGET_DATE_TIME must parse as a valid date.");

function makeElement() {
    return {
        className: "",
        textContent: "",
        dataset: {},
        children: [],
        isConnected: true,
        attributes: new Map(),
        append(...items) {
            this.children.push(...items);
        },
        replaceChildren(...items) {
            this.children = items;
        },
        querySelectorAll() {
            return [];
        },
        setAttribute(name, value) {
            this.attributes.set(name, value);
        },
        replaceWith() {},
        addEventListener() {},
        getBoundingClientRect() {
            return {};
        },
        classList: {
            add() {},
        },
    };
}

function runCountdownAt(nowMs) {
    let intervalCalls = 0;
    let clearCalls = 0;
    const elements = new Map([
        ["days", makeElement()],
        ["hours", makeElement()],
        ["minutes", makeElement()],
        ["seconds", makeElement()],
    ]);

    class FakeDate extends Date {
        static now() {
            return nowMs;
        }
    }

    const context = {
        Date: FakeDate,
        document: {
            getElementById(id) {
                return elements.get(id);
            },
            createElement() {
                return makeElement();
            },
        },
        window: {
            requestAnimationFrame(callback) {
                callback();
            },
            setTimeout() {
                return 1;
            },
        },
        setInterval() {
            intervalCalls += 1;
            return 123;
        },
        clearInterval() {
            clearCalls += 1;
        },
        console,
    };

    vm.runInNewContext(script, context, { filename: htmlPath.pathname });
    return { intervalCalls, clearCalls, elements };
}

const active = runCountdownAt(targetTime - 1000);
assert.equal(active.intervalCalls, 1, "A future countdown should schedule periodic updates.");

const expired = runCountdownAt(targetTime + 1000);
assert.equal(expired.intervalCalls, 0, "An expired countdown must not schedule a background interval.");
assert.equal(expired.clearCalls, 0, "An expired countdown should not need to clear a timer that was never created.");

for (const id of ["days", "hours", "minutes", "seconds"]) {
    assert.equal(expired.elements.get(id).attributes.get("aria-label"), "00", `${id} should render as zero after expiry.`);
}

console.log("Countdown timer lifecycle test passed.");
