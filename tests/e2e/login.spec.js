// TAREFA 1: login, navegação por telas e validação de elementos
const { test } = require("../support/fixtures");
const { MenuInferior } = require("../screens/MenuInferior");
const { LoginScreen } = require("../screens/LoginScreen");
const { FormsScreen } = require("../screens/FormsScreen");
const { AlertaNativo } = require("../screens/AlertaNativo");
const dados = require("../data/login.json");
const navegacao = require("../data/navegacao.json");
const { evidencia } = require("../support/evidencia");

const tela = (aba) => navegacao.telas.find((t) => t.aba === aba);
const todasAsMensagens = Object.values(dados.mensagens);

test.describe("Login e navegação", () => {
  let menu;
  let login;
  let alerta;

  test.beforeEach(async ({ driver }) => {
    menu = new MenuInferior(driver);
    login = new LoginScreen(driver);
    alerta = new AlertaNativo(driver);
    await menu.abrir("Login");
    await login.deveEstarVisivel();
  });

  test.describe("Cenários positivos", { tag: "@positivo" }, () => {
    test("faz login com credenciais válidas, navega pelas telas e valida os elementos", async ({ driver }) => {
      await login.entrar(dados.usuarioValido);
      await alerta.deveExibir(dados.alertaLogin);
      await evidencia(driver, "Login realizado com sucesso");
      await alerta.confirmar();
      await login.devePermanecerNaTela();

      await menu.abrir("Forms");
      await menu.deveExibirTela(tela("Forms"));
      await new FormsScreen(driver).deveExibirBotoes();
      await evidencia(driver, "Tela Forms com os botões");

      await menu.abrir("Swipe");
      await menu.deveExibirTela(tela("Swipe"));
      await evidencia(driver, "Tela Swipe");

      await menu.abrir("Home");
      await menu.deveExibirTela(tela("Home"));
      await evidencia(driver, "De volta à Home");
    });
  });

  test.describe("Cenários negativos", { tag: "@negativo" }, () => {
    for (const caso of dados.loginsInvalidos) {
      test(`recusa login com ${caso.descricao}`, async ({ driver }) => {
        await login.entrar(caso);

        await login.deveExibirSomenteErros(caso.erros.map((e) => dados.mensagens[e]), todasAsMensagens);
        await alerta.naoDeveAparecerDurante();
        await login.devePermanecerNaTela();
        await evidencia(driver, `Login recusado: ${caso.descricao}`);
      });
    }
  });
});
