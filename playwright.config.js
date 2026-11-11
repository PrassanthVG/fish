import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  webServer: {
    command: "npm run dev -- --port 3200",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 60000,
    env: { ADMIN_EMAIL: "test@example.com", ADMIN_INITIAL_PASSWORD: "test-password-123" },
  },
  use: {
    baseURL: "http://localhost:3200",
  },
});
