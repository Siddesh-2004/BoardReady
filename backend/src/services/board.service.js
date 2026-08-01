import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { boards } from "../db/board.schema.js";
import { ApiError } from "../utils/apiErrors.js";

const generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex");
};

const createBoard = async ({ name, submissionMode, allowedOrigin }) => {
    const existing = await db
        .select()
        .from(boards)
        .where(eq(boards.name, name))
        .limit(1);

    if (existing.length > 0) {
        throw new ApiError(409, `Board name "${name}" is already taken`);
    }

    const apiKey = generateApiKey();

    const [board] = await db
        .insert(boards)
        .values({
            name,
            apiKey,
            submissionMode,
            allowedOrigin,
        })
        .returning();

    return board;
};

const getBoardByName = async (name) => {
    const result = await db
        .select()
        .from(boards)
        .where(eq(boards.name, name))
        .limit(1);

    return result[0] || null;
};

const validateBoardAccess = async (name, apiKey) => {
    const board = await getBoardByName(name);

    if (!board) {
        throw new ApiError(404, `Board "${name}" does not exist`);
    }

    if (!apiKey || board.apiKey !== apiKey) {
        throw new ApiError(401, "Invalid API key");
    }

    return board;
};

export { createBoard, getBoardByName, validateBoardAccess };