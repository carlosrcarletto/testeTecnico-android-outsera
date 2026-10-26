// @ts-check
import { defineConfig } from "@playwright/test";
import { APP, APPIUM } from "./tests/support/capabilities.js";

/**
 * Playwright Test é usado como executor e para asserções e relatórios.
 * O aparelho é controlado pelo Appium (via WebdriverIO) — veja tests/support/fixtures.js.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Um emulador executa um teste por vez */
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Testes mobile são mais lentos que web: 2 min por teste, 15 s por espera */
  timeout: 120_000,
  expect: { timeout: 15_000 },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          Plataforma: "Android",
          App: `WebdriverIO Native Demo App v${APP.versao}`,
          Automacao: "Appium 3 + UiAutomator2 (WebdriverIO)",
          Aparelho: process.env.DEVICE_NAME || "Android Emulator",
          Node: process.version,
        },
      },
    ],
  ],

  /* Sobe o Appium antes dos testes (baixa o APK e instala o driver se faltar) */
  webServer: {
    command: "npm run appium",
    url: `http://${APPIUM.hostname}:${APPIUM.port}/status`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
  },
});
