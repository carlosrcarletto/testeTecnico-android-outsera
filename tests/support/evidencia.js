const { test } = require("@playwright/test");

// Tira um print da tela do aparelho e anexa ao teste (aparece no Allure e no relatório HTML)
async function evidencia(driver, nome) {
  await test.step(`Evidência: ${nome}`, async () => {
    const base64 = await driver.takeScreenshot();
    await test.info().attach(nome, { body: Buffer.from(base64, "base64"), contentType: "image/png" });
  });
}

module.exports = { evidencia };
