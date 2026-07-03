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

const broadcastLeaderboard = (boardId, data) => {
    // later: only send to clients subscribed to this boardId's room
    // for v1: broadcast to everyone, boardId currently unused here
};


const deleteBoard=async ()=>{
    await redisClient.del("leaderboard:main");
}

export {addScore, getTopScores, deleteBoard}