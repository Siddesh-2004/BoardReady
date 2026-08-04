import "dotenv/config";
import { beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { connectRedis } from "../src/config/redis.config.js";
import { boards } from "../src/db/schemas/board.schema.js";

// A separate db client, pointed at the TEST database only.
// Never import your real ../src/db/index.js in tests — that
// connects to your dev database, which we don't want to touch.
export const testDb = drizzle({
  connection: process.env.DATABASE_URL_TEST,
});

// Wipes the boards table before each test file runs, so tests
// don't see leftover data from a previous run.
export async function clearBoardsTable() {
  console.log("clearing boards table");
  await testDb.delete(boards);
}

// Inserts a board directly (bypassing the /boards route, since
// this is test setup, not the feature under test). Callers can
// override any field; sensible defaults are provided for the rest.
export async function seedBoard(overrides = {}) {
  const [board] = await testDb
    .insert(boards)
    .values({
      name: overrides.name || `test-board-${Date.now()}`,
      apiKey: overrides.apiKey || "test-api-key",
      submissionMode: overrides.submissionMode || "rest",
      allowedOrigin: overrides.allowedOrigin || null,
      ...overrides,
    })
    .returning();

  return board;
}

let redis;

beforeAll(async () => {
    console.log("Starting server & connecting to test Redis...");
    redis = await connectRedis();
});

afterAll(async () => {
    console.log("Closing test Redis connection...");
    if (redis) {
        await redis.quit(); // Gracefully closes the connection so Vitest doesn't hang
    }
});