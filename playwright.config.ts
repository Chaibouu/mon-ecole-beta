import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev",
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  testDir: "__e2e__",
  timeout: 60000,
});



























