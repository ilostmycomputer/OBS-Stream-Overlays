import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const workingDirectory = fileURLToPath(new URL(".", import.meta.url));
const port = 20000 + crypto.randomInt(20000);
const bridge = spawn(process.execPath, ["bridge.mjs"], {
    cwd: workingDirectory,
    env: { ...process.env, TYPING_OBS_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
});

const sockets = new Set();

function withTimeout(promise, label, timeoutMs = 5000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            const timer = setTimeout(() => reject(new Error(`${label} timed out.`)), timeoutMs);
            timer.unref();
        }),
    ]);
}

function waitForBridge() {
    return withTimeout(new Promise((resolve, reject) => {
        let stderr = "";

        bridge.stdout.setEncoding("utf8");
        bridge.stderr.setEncoding("utf8");
        bridge.stderr.on("data", chunk => {
            stderr += chunk;
        });
        bridge.stdout.on("data", chunk => {
            if (chunk.includes("Typing OBS bridge listening")) resolve();
        });
        bridge.once("exit", code => {
            reject(new Error(`Bridge exited before listening (code ${code}). ${stderr}`));
        });
        bridge.once("error", reject);
    }), "bridge startup");
}

function connect(role) {
    return withTimeout(new Promise((resolve, reject) => {
        const socket = new WebSocket(`ws://127.0.0.1:${port}?role=${role}`);
        sockets.add(socket);
        socket.once("open", () => resolve(socket));
        socket.once("error", reject);
    }), `${role} connection`);
}

function nextMessage(socket, label) {
    return withTimeout(new Promise((resolve, reject) => {
        socket.once("message", raw => {
            try {
                resolve(JSON.parse(raw.toString()));
            } catch (error) {
                reject(error);
            }
        });
        socket.once("error", reject);
    }), label);
}

function waitForClose(socket, label) {
    return withTimeout(new Promise((resolve, reject) => {
        socket.once("close", (code, reason) => resolve({ code, reason: reason.toString() }));
        socket.once("error", reject);
    }), label);
}

try {
    await waitForBridge();

    const overlay = await connect("overlay");
    const publisher = await connect("publisher");

    const nonce = crypto.randomUUID();
    const pongPromise = nextMessage(publisher, "health response");
    publisher.send(JSON.stringify({ type: "ping", nonce }));
    assert.deepEqual(await pongPromise, { type: "pong", nonce });

    const event = {
        type: "typing",
        username: "test-user",
        channelName: "test-channel",
        avatarUrl: "https://cdn.example.invalid/avatar.png",
        timestamp: Date.now(),
    };
    const forwardedPromise = nextMessage(overlay, "forwarded typing event");
    publisher.send(JSON.stringify(event));
    assert.deepEqual(await forwardedPromise, event);

    const rejected = new WebSocket(`ws://127.0.0.1:${port}?role=invalid`);
    sockets.add(rejected);
    const rejectedClose = waitForClose(rejected, "invalid-role rejection");
    const { code } = await rejectedClose;
    assert.equal(code, 1008);

    publisher.send(JSON.stringify({ type: "typing", username: "", channelName: "test" }));
    await new Promise(resolve => setTimeout(resolve, 150));

    console.log("Bridge smoke test passed.");
} finally {
    for (const socket of sockets) {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.terminate();
        }
    }

    bridge.kill("SIGTERM");
    await withTimeout(new Promise(resolve => bridge.once("exit", resolve)), "bridge shutdown", 3000)
        .catch(() => bridge.kill("SIGKILL"));
}
