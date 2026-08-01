import { WebSocket } from "ws";
import { addScore, getTopScores } from "./redis.service.js";
import { validateBoardAccess, getBoardByName } from "./board.service.js";

// Map<boardId (name), Set<socket>> — watchers only
const boardConnections = new Map();

const extractBoardIdFromPath = (url, prefix) => {
    // e.g. "/ws/typingrace" with prefix "/ws/" -> "typingrace"
    return url.replace(prefix, "").split("?")[0].split("/")[0];
};

const extractApiKey = (req) => {
    const authHeader = req.headers.authorization || "";
    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const addWatcher = (boardId, socket) => {
    if (!boardConnections.has(boardId)) {
        boardConnections.set(boardId, new Set());
    }
    boardConnections.get(boardId).add(socket);
};

const removeWatcher = (boardId, socket) => {
    boardConnections.get(boardId)?.delete(socket);
};

const broadcastToWatchers = (boardId, data) => {
    const sockets = boardConnections.get(boardId);
    if (!sockets) return;

    const payload = JSON.stringify({ type: "leaderboard_update", data });

    sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(payload);
        }
    });
};

// ---------- Watcher connections (/ws/{boardId}) ----------

const handleWatcherConnection = async (socket, req) => {
    const boardId = extractBoardIdFromPath(req.url, "/ws/");

    const board = await getBoardByName(boardId);
    if (!board) {   
        socket.close(1008, "Board does not exist");
        return;
    }

    addWatcher(boardId, socket);

    const topScores = await getTopScores(boardId);
    socket.send(JSON.stringify({ type: "leaderboard_update", data: topScores }));

    socket.on("close", () => {
        removeWatcher(boardId, socket);
    });
};

// ---------- Submitter connections (/submit/{boardId}) ----------

const handleSubmitterConnection = async (socket, req) => {
    const boardId = extractBoardIdFromPath(req.url, "/submit/");
    const apiKey = extractApiKey(req);

    let board;
    try {
        board = await validateBoardAccess(boardId, apiKey);
    } catch (err) {
        socket.close(1008, err.message || "Unauthorized");
        return;
    }

    socket.on("message", async (data) => {
        let payload;

        try {
            payload = JSON.parse(data);
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

        await addScore(boardId, name, score);
        const topScores = await getTopScores(boardId);

        broadcastToWatchers(boardId, topScores);
    });
};

export { handleWatcherConnection, handleSubmitterConnection };