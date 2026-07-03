import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    retryStrategy(times) {
        const delay = Math.min(200 * Math.pow(2, times - 1), 10000);
        console.log(`Redis retry attempt ${times}, retrying in ${delay}ms`);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

const connectRedis = () => {
    return new Promise((resolve, reject) => {
        redisClient.on("connect", () => {
            console.log("Redis connecting...");
        });

        redisClient.on("ready", () => {
            console.log("Redis connected and ready");
            resolve(redisClient);
        });

        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
            reject(err);
        });
    });
};

export { redisClient, connectRedis };