import { addScore, getTopScores,deleteBoard } from "./redis.service.js";
import { WebSocket } from "ws";

const BOARD_ID = "main"; // hardcoded for v1, single board

const handleConnection = async (socket, wss) => {
    console.log("Client connected via ws");
    // await deleteBoard();
    const topScores = await getTopScores(BOARD_ID);
    socket.send(JSON.stringify({ type: "leaderboard_update", data: topScores }));
};

const handleMessage = async (socket, data, wss) => {
    let payload;
    try {
        payload = JSON.parse(data);
        console.log(payload);
    } catch (err) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
    }

    if (payload.type !== "submit_score") {
        socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
        return;
    }

    const { name, score } = payload;

    if (typeof name !== "string" || name.trim().length === 0) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid name" }));
        return;
    }

    if (typeof score !== "number" || !Number.isFinite(score)) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid score" }));
        return;
    }

    await addScore(BOARD_ID, name, score);
    const topScores = await getTopScores(BOARD_ID);

    broadcastLeaderboard(wss, topScores);
};

const handleClose = (socket, wss) => {
    console.log("Client disconnected");
};

const broadcastLeaderboard = (wss, data) => {
    const payload = JSON.stringify({ type: "leaderboard_update", data });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            console.log(payload);
            client.send(payload);
        }
    });
};

export { handleConnection, handleMessage, handleClose, broadcastLeaderboard };