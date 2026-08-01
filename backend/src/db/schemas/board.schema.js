import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const submissionModeEnum = pgEnum("submission_mode", [
  "realtime",
  "rest",
]);

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(), // e.g. "typingrace" — used as Redis key
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  allowedOrigin: varchar("allowed_origin", { length: 255 }), // e.g. "https://typingrace.com" (optional for now)
  submissionMode: submissionModeEnum("submission_mode")
    .notNull()
    .default("rest"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
