import http from "http";
import app from "./app.js";
import { connectRedis } from "./config/redis.config.js";
import { initWebSocket } from "./config/websocket.config.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

initWebSocket(server);

connectRedis()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to Redis. Server not started.", err);
        process.exit(1);
    });