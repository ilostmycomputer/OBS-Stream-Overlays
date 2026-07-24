import { WebSocket, WebSocketServer } from "ws";

const HOST = "127.0.0.1";
const PORT = Number(process.env.TYPING_OBS_PORT ?? 8765);
const MAX_TEXT_LENGTH = 200;
const MAX_AVATAR_URL_LENGTH = 2048;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("TYPING_OBS_PORT must be an integer between 1 and 65535.");
}

const roles = new WeakMap();
const server = new WebSocketServer({
    host: HOST,
    port: PORT,
    maxPayload: 64 * 1024,
});

function isBoundedString(value, maxLength, { allowEmpty = false } = {}) {
    return typeof value === "string"
        && value.length <= maxLength
        && (allowEmpty || value.trim().length > 0);
}

server.on("connection", (socket, request) => {
    const role = new URL(request.url ?? "/", `http://${HOST}`).searchParams.get("role");

    if (role !== "publisher" && role !== "overlay") {
        socket.close(1008, "Invalid role");
        return;
    }

    roles.set(socket, role);

    socket.on("message", raw => {
        if (roles.get(socket) !== "publisher") return;

        try {
            const event = JSON.parse(raw.toString());

            if (event?.type === "ping" && isBoundedString(event.nonce, 100)) {
                socket.send(JSON.stringify({ type: "pong", nonce: event.nonce }));
                return;
            }

            if (
                event?.type !== "typing"
                || !isBoundedString(event.username, MAX_TEXT_LENGTH)
                || !isBoundedString(event.channelName, MAX_TEXT_LENGTH)
                || !isBoundedString(event.avatarUrl ?? "", MAX_AVATAR_URL_LENGTH, { allowEmpty: true })
            ) return;

            const safeEvent = {
                type: "typing",
                username: event.username.trim(),
                channelName: event.channelName.trim(),
                avatarUrl: event.avatarUrl ?? "",
                timestamp: Number.isFinite(event.timestamp) ? event.timestamp : Date.now(),
            };

            for (const client of server.clients) {
                if (roles.get(client) === "overlay" && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(safeEvent));
                }
            }
        } catch {
            // Ignore malformed messages from the local publisher.
        }
    });
});

server.on("listening", () => {
    console.log(`Typing OBS bridge listening on ws://${HOST}:${PORT}`);
});

server.on("error", error => {
    console.error("Typing OBS bridge error:", error);
});

function shutDown(signal) {
    console.log(`Stopping typing OBS bridge (${signal}).`);

    for (const client of server.clients) {
        client.close(1001, "Bridge stopping");
    }

    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 3000).unref();
}

process.once("SIGINT", () => shutDown("SIGINT"));
process.once("SIGTERM", () => shutDown("SIGTERM"));
