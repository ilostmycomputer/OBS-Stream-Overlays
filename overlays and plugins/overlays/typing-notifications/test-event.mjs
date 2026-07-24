import WebSocket from "ws";

const port = Number(process.env.TYPING_OBS_PORT ?? 8765);
const socket = new WebSocket(`ws://127.0.0.1:${port}?role=publisher`);

socket.once("open", () => {
    socket.send(JSON.stringify({
        type: "typing",
        username: "test-user",
        channelName: "test-channel",
        avatarUrl: "",
        timestamp: Date.now(),
    }));

    console.log("Sent a test typing event.");
    setTimeout(() => socket.close(), 100);
});

socket.once("error", error => {
    console.error("Could not connect to the local bridge. Start it with npm start first.");
    console.error(error.message);
    process.exitCode = 1;
});

