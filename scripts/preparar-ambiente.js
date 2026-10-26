// Prepara o ambiente antes de subir o Appium:
//  1. Baixa o APK do app de exemplo (se ainda não estiver em apps/)
//  2. Instala o driver UiAutomator2 do Appium (se ainda não estiver instalado)
// Roda sozinho no início do "npm test" (via webServer do playwright.config.js)
// ou manualmente com "npm run preparar".
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { APP } = require("../tests/support/capabilities");

const DRIVER = { nome: "uiautomator2", versao: "8.7.1" };

async function baixarApp() {
  if (fs.existsSync(APP.caminho) && fs.statSync(APP.caminho).size > 1_000_000) {
    console.log(`[preparar] App já disponível: ${path.relative(process.cwd(), APP.caminho)}`);
    return;
  }
  console.log(`[preparar] Baixando o app de exemplo (~120 MB)\n           ${APP.url}`);
  fs.mkdirSync(path.dirname(APP.caminho), { recursive: true });
  const resposta = await fetch(APP.url);
  if (!resposta.ok) throw new Error(`Falha ao baixar o APK: HTTP ${resposta.status}`);
  const temporario = `${APP.caminho}.parcial`;
  fs.writeFileSync(temporario, Buffer.from(await resposta.arrayBuffer()));
  fs.renameSync(temporario, APP.caminho); // evita APK pela metade se o download cair
  console.log("[preparar] Download concluído");
}

function appium(args) {
  const binario = path.join(__dirname, "..", "node_modules", ".bin", process.platform === "win32" ? "appium.cmd" : "appium");
  return spawnSync(binario, args, { encoding: "utf8", shell: process.platform === "win32" });
}

function instalarDriver() {
  const lista = appium(["driver", "list", "--installed", "--json"]);
  let instalados = {};
  try {
    instalados = JSON.parse(lista.stdout || "{}");
  } catch {
    // saída inesperada: tenta instalar mesmo assim
  }
  if (instalados[DRIVER.nome]) {
    console.log(`[preparar] Driver ${DRIVER.nome} já instalado (${instalados[DRIVER.nome].version})`);
    return;
  }
  console.log(`[preparar] Instalando o driver ${DRIVER.nome}@${DRIVER.versao} do Appium…`);
  const instalacao = appium(["driver", "install", `${DRIVER.nome}@${DRIVER.versao}`]);
  process.stdout.write(instalacao.stdout || "");
  if (instalacao.status !== 0) {
    process.stderr.write(instalacao.stderr || "");
    throw new Error(`Não foi possível instalar o driver ${DRIVER.nome}`);
  }
}

baixarApp()
  .then(instalarDriver)
  .catch((erro) => {
    console.error(`[preparar] ${erro.message}`);
    process.exit(1);
  });
