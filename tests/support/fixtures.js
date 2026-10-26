// Fixtures do Playwright Test que entregam aos testes um "driver" do Appium (WebdriverIO).
//  sessao → uma sessão Appium por worker: abrir sessão é caro (instala app e servidor
//           UiAutomator2), então ela é reaproveitada entre os testes.
//  driver → por teste: reinicia o app do zero (testes independentes), grava vídeo da
//           tela e, no final, anexa print, vídeo e (se falhar) a hierarquia de telas.
const base = require("@playwright/test");
const { remote } = require("webdriverio");
const { APP, APPIUM, capabilities } = require("./capabilities");

const test = base.test.extend({
  sessao: [
    async ({}, use) => {
      const sessao = await remote({
        ...APPIUM,
        capabilities,
        logLevel: "warn",
        waitforTimeout: 15_000,
        connectionRetryTimeout: 300_000,
        connectionRetryCount: 1,
      });
      await use(sessao);
      await sessao.deleteSession().catch(() => {});
    },
    { scope: "worker", timeout: 420_000 },
  ],

  driver: async ({ sessao }, use, testInfo) => {
    await base.test.step("Abrir o app do zero", async () => {
      await sessao.execute("mobile: terminateApp", { appId: APP.pacote });
      await sessao.execute("mobile: activateApp", { appId: APP.pacote });
      await sessao.$("~Home-screen").waitForDisplayed({ timeout: 30_000, timeoutMsg: "O app não abriu na tela Home" });
    });

    // Vídeo é evidência "best effort": se o aparelho não suportar, o teste segue
    const gravando = await sessao
      .startRecordingScreen({ timeLimit: 180, forceRestart: true })
      .then(() => true)
      .catch(() => false);

    await use(sessao);

    const falhou = testInfo.status !== testInfo.expectedStatus;
    try {
      const print = await sessao.takeScreenshot();
      await testInfo.attach("screenshot", { body: Buffer.from(print, "base64"), contentType: "image/png" });
      if (falhou) {
        // Hierarquia de elementos da tela no momento da falha: mostra o que o Appium "via"
        await testInfo.attach("hierarquia-da-tela.xml", { body: await sessao.getPageSource(), contentType: "application/xml" });
      }
      if (gravando) {
        const video = await sessao.stopRecordingScreen();
        await testInfo.attach("video", { body: Buffer.from(video, "base64"), contentType: "video/mp4" });
      }
    } catch (erro) {
      console.warn(`Não foi possível coletar as evidências finais: ${erro.message}`);
    }
  },
});

module.exports = { test, expect: base.expect };
