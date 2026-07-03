import { WebSocketServer } from "ws";

let wss;

const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });
    console.log("WebSocket server initialized");
    wss.on("connection", (socket) => {
        console.log(`${socket._socket.remoteAddress} connected via ws`);

        socket.on("close", () => {
            console.log(`${socket._socket.remoteAddress} disconnected`);
        });
    });
};

const getWss = () => {
    if (!wss) {
        throw new Error("WebSocket server not initialized. Call initWebSocket(server) first.");
    }
    return wss;
};

export { initWebSocket, getWss };