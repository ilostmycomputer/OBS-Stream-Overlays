import crypto from "node:crypto";
import WebSocket from "ws";

const port = Number(process.env.TYPING_OBS_PORT ?? 8765);
const timeoutMs = Number(process.env.TYPING_OBS_HEALTH_TIMEOUT_MS ?? 1500);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("TYPING_OBS_PORT must be an integer between 1 and 65535.");
    process.exit(2);
}

const nonce = crypto.randomUUID();
const socket = new WebSocket(`ws://127.0.0.1:${port}?role=publisher`);
let finished = false;

function finish(code, message) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (message) console.error(message);

    if (socket.readyState === WebSocket.OPEN) socket.close();
    else socket.terminate();

    process.exitCode = code;
}

const timer = setTimeout(() => {
    finish(1, `No healthy typing bridge responded on port ${port}.`);
}, timeoutMs);

socket.once("open", () => {
    socket.send(JSON.stringify({ type: "ping", nonce }));
});

socket.on("message", raw => {
    try {
        const message = JSON.parse(raw.toString());
        if (message?.type === "pong" && message.nonce === nonce) {
            console.log(`Typing OBS bridge is healthy on port ${port}.`);
            finish(0);
        }
    } catch {
        finish(1, `A service answered on port ${port}, but it was not the typing bridge.`);
    }
});

socket.once("error", () => {
    finish(1, `Could not connect to the typing bridge on port ${port}.`);
});
