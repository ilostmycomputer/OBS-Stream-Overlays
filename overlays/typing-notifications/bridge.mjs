import { WebSocketServer } from "ws";

const HOST = "127.0.0.1";
const PORT = Number(process.env.TYPING_OBS_PORT ?? 8765);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("TYPING_OBS_PORT must be an integer between 1 and 65535.");
}

const roles = new WeakMap();

const server = new WebSocketServer({ host: HOST, port: PORT });

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
            if (
                event?.type !== "typing"
                || typeof event.username !== "string"
                || typeof event.channelName !== "string"
            ) return;

            for (const client of server.clients) {
                if (roles.get(client) === "overlay" && client.readyState === 1) {
                    client.send(JSON.stringify(event));
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

