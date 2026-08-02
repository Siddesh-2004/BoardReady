import { describe, it, expect, beforeEach } from "vitest";
import { createBoard } from "../../src/services/board.service.js";
import { clearBoardsTable } from "../setup.js";

describe("createBoard", () => {
    beforeEach(async () => {
        // clean slate before each test
        await clearBoardsTable();
    });

    it("creates a board and returns the full record including apiKey", async () => {
        const board = await createBoard({
            name: "typingrace",
            submissionMode: "realtime",
            allowedOrigin: "https://typingrace.com",
        });

        expect(board).toBeDefined();
        expect(board.id).toBeTypeOf("number");
        expect(board.name).toBe("typingrace");
        expect(board.submissionMode).toBe("realtime");
        expect(board.allowedOrigin).toBe("https://typingrace.com");
        expect(board.apiKey).toBeTypeOf("string");
        expect(board.apiKey.length).toBeGreaterThan(0);
        expect(board.createdAt).toBeDefined();
    });

    it("generates a unique apiKey for each board", async () => {
        const board1 = await createBoard({
            name: "board-one",
            submissionMode: "rest",
            allowedOrigin: null,
        });

        const board2 = await createBoard({
            name: "board-two",
            submissionMode: "rest",
            allowedOrigin: null,
        });

        expect(board1.apiKey).not.toBe(board2.apiKey);
    });

    it("throws a 409 error when the board name already exists", async () => {
        await createBoard({
            name: "duplicate-name",
            submissionMode: "rest",
            allowedOrigin: null,
        });

        await expect(
            createBoard({
                name: "duplicate-name",
                submissionMode: "rest",
                allowedOrigin: null,
            })
        ).rejects.toMatchObject({
            statusCode: 409,
        });
    });
});