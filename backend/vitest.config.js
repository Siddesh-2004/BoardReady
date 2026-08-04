import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        globals: true,
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        testTimeout: 10000,
    },
});