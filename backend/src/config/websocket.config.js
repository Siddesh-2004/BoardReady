import { WebSocketServer } from "ws";
import {
    handleWatcherConnection,
    handleSubmitterConnection,
} from "../services/websocket.service.js";

let watchWss;
let submitWss;

const initWebSocket = (server) => {
    watchWss = new WebSocketServer({ noServer: true });
    submitWss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
        if (req.url.startsWith("/submit/")) {
            submitWss.handleUpgrade(req, socket, head, (ws) => {
                submitWss.emit("connection", ws, req);
            });
        } else if (req.url.startsWith("/ws/")) {
            watchWss.handleUpgrade(req, socket, head, (ws) => {
                watchWss.emit("connection", ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    watchWss.on("connection", (socket, req) => {
        handleWatcherConnection(socket, req, watchWss);

        socket.on("message", (data) => {
            // watchers are read-only; ignore any messages they send
        });

        socket.on("close", () => {
            // cleanup handled inside handleWatcherConnection's returned cleanup, if needed
        });
    });

    submitWss.on("connection", (socket, req) => {
        handleSubmitterConnection(socket, req, submitWss);
    });
};

export { initWebSocket };