import { ApiError } from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import { createBoard as createBoardService } from "../services/board.service.js";

const VALID_MODES = ["realtime", "rest"];

const createBoard = asyncHandler(async (req, res) => {
    const { name, submissionMode, allowedOrigin } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
        throw new ApiError(400, "Board name is required");
    }

    if (!VALID_MODES.includes(submissionMode)) {
        throw new ApiError(400, `submissionMode must be one of: ${VALID_MODES.join(", ")}`);
    }

    const board = await createBoardService({
        name: name.trim(),
        submissionMode,
        allowedOrigin: allowedOrigin || null,
    });

    return res
        .status(201)
        .json(new ApiResponse(board, "Board created successfully", 201));
});

export { createBoard };