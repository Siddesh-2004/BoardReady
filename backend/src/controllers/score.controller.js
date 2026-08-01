import { ApiError } from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import { validateBoardAccess } from "../services/board.service.js";
import { addScore, getTopScores } from "../services/redis.service.js";
import { broadcastToWatchers } from "../services/websocket.service.js";

const BEARER_PREFIX = "Bearer ";

const extractApiKey = (req) => {
    const authHeader = req.headers.authorization || "";
    return authHeader.startsWith(BEARER_PREFIX) ? authHeader.slice(BEARER_PREFIX.length) : null;
};

const submitScore = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const { name, score } = req.body;
    const apiKey = extractApiKey(req);

    await validateBoardAccess(boardId, apiKey);

    if (typeof name !== "string" || name.trim().length === 0) {
        throw new ApiError(400, "Invalid name");
    }

    if (typeof score !== "number" || !Number.isFinite(score)) {
        throw new ApiError(400, "Invalid score");
    }

    await addScore(boardId, name.trim(), score);
    const topScores = await getTopScores(boardId);

    broadcastToWatchers(boardId, topScores);

    return res
        .status(200)
        .json(new ApiResponse(topScores, "Score submitted successfully", 200));
});

export { submitScore };