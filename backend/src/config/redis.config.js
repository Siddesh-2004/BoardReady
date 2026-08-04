import Redis from "ioredis";

const getRedisConfig = () => {
    console.log("VITEST:", process.env.VITEST);
    console.log("REDIS_HOST:", process.env.REDIS_HOST);
    console.log("REDIS_PORT:", process.env.REDIS_PORT);
    
    if (process.env.VITEST) {   
        return {
            host: process.env.TEST_REDIS_HOST || "127.0.0.1",
            port: Number(process.env.TEST_REDIS_PORT) || 6380,
        };
    }
    return {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,   
    };
};

const MAX_STARTUP_RETRIES = 10;

let redisClient = null;

const getRedisClient = () => {
    if (!redisClient) {
        const config = getRedisConfig();

        redisClient = new Redis({
            ...config,
            lazyConnect: true, // Prevents automatic connection on instantiation
            retryStrategy(times) {  
                if (times > MAX_STARTUP_RETRIES) {
                    return null;
                }
                console.log("retrying redis connection");
                return Math.min(200 * Math.pow(2, times - 1), 10000);
            },
            maxRetriesPerRequest: 3,
        });

        // Set up global status logs once
        redisClient.on("connect", () => console.log("Redis connecting..."));
        redisClient.on("ready", () => console.log("Redis connected and ready"));
        redisClient.on("error", (err) => {
            console.error(`Redis connection error on port ${redisClient.options.port}:`, err.message);
        });
    }

    return redisClient;
};

const connectRedis = async () => {
    const client = getRedisClient();

    // If already connected or in the process of connecting, return immediately
    if (client.status === "ready" || client.status === "connecting") {
        return client;
    }

    try {
        await client.connect();
        return client;
    } catch (err) {
        throw new Error(`Redis connection failed on port ${client.options.port} after retries: ${err.message}`);
    }
};

export { redisClient, connectRedis };