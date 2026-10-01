import { defineConfig, devices } from "@playwright/test";

/*
 * Browser tests against a running site (`npm run dev` with the API on).
 * They use the Chrome installed on this computer, so no browser download.
 * E2E_BASE_URL picks another address, e.g. a staging site.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    channel: "chrome",
    locale: "sq-AL",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, channel: "chrome" } },
  ],
});
