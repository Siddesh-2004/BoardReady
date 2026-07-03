import { WebSocketServer } from "ws";
import { handleConnection, handleMessage, handleClose } from "../services/websocket.service.js";

let wss;

const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (socket) => {
        handleConnection(socket, wss);
        socket.on("message", (data) => handleMessage(socket, data, wss));
        socket.on("close", () => handleClose(socket, wss));
    });

    return wss;
};

export { initWebSocket };