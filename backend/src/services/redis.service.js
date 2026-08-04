import { redisClient } from "../config/redis.config.js";

const boardKey = (boardId) => `leaderboard:${boardId}`;

const addScore = async (boardId, name, score) => {
    await redisClient.zadd(boardKey(boardId), score, name);
};

const getTopScores = async (boardId, limit = 10) => {
    const raw = await redisClient.zrevrange(boardKey(boardId), 0, limit - 1, "WITHSCORES");
    // reshape flat [name, score, name, score...] into [{name, score}, ...]
    const result = [];
    for (let i = 0; i < raw.length; i += 2) {
        result.push({ name: raw[i], score: Number(raw[i + 1]) });
    }
    return result;
};

const deleteBoard = async (boardId) => {
    await redisClient.del(boardKey(boardId));
};

export { addScore, getTopScores, deleteBoard }; 