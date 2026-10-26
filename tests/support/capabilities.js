// Configuração do app, do servidor Appium e das capabilities da sessão Android.
// Valores podem ser sobrescritos por variável de ambiente (ex.: UDID para um celular real).
const path = require("path");

const VERSAO_APP = "2.2.0";

const APP = {
  versao: VERSAO_APP,
  pacote: "com.wdiodemoapp",
  atividade: ".MainActivity",
  caminho: path.resolve(__dirname, "..", "..", "apps", `android.wdio.native.app.v${VERSAO_APP}.apk`),
  url: `https://github.com/webdriverio/native-demo-app/releases/download/v${VERSAO_APP}/android.wdio.native.app.v${VERSAO_APP}.apk`,
};

const APPIUM = {
  hostname: process.env.APPIUM_HOST || "127.0.0.1",
  port: Number(process.env.APPIUM_PORT) || 4723,
  path: "/",
};

// https://github.com/appium/appium-uiautomator2-driver#capabilities
const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.DEVICE_NAME || "Android Emulator",
  ...(process.env.UDID ? { "appium:udid": process.env.UDID } : {}),
  "appium:app": APP.caminho,
  "appium:appPackage": APP.pacote,
  "appium:appActivity": APP.atividade,
  "appium:autoGrantPermissions": true,
  // Esconde o teclado virtual durante toda a sessão: evita que ele cubra botões
  // e elimina chamadas frágeis de hideKeyboard() nos testes.
  "appium:hideKeyboard": true,
  "appium:newCommandTimeout": 240,
  // Primeira execução instala o servidor do UiAutomator2 no aparelho: no CI é lento
  "appium:uiautomator2ServerInstallTimeout": 120_000,
  "appium:uiautomator2ServerLaunchTimeout": 120_000,
  "appium:adbExecTimeout": 120_000,
  "appium:androidInstallTimeout": 180_000,
};

module.exports = { APP, APPIUM, capabilities };
