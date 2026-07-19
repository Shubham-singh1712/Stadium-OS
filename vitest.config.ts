import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/src/tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/tests/**",
        "src/types/**",
        "src/app/globals.css",
        "src/**/*.d.ts",
        "src/app/layout.tsx",
        "src/app/favicon.ico",
      ],
      thresholds: {
        lines: 56,
        functions: 58,
        branches: 51,
        statements: 57,
      },
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
