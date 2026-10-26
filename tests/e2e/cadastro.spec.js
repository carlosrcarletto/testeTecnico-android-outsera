// TAREFA 2: preencher o formulário de cadastro (Sign up) e enviar os dados
const { test } = require("../support/fixtures");
const { MenuInferior } = require("../screens/MenuInferior");
const { LoginScreen } = require("../screens/LoginScreen");
const { AlertaNativo } = require("../screens/AlertaNativo");
const dados = require("../data/login.json");
const { evidencia } = require("../support/evidencia");

const todasAsMensagens = Object.values(dados.mensagens);

test.describe("Formulário de cadastro (Sign up)", () => {
  let login;
  let alerta;

  test.beforeEach(async ({ driver }) => {
    login = new LoginScreen(driver);
    alerta = new AlertaNativo(driver);
    await new MenuInferior(driver).abrir("Login");
    await login.deveEstarVisivel();
    await login.abrirCadastro();
  });

  test("cadastra usuário com dados válidos", { tag: "@positivo" }, async ({ driver }) => {
    const { email, senha } = dados.usuarioValido;
    await login.cadastrar({ email, senha, confirmacao: senha });
    await evidencia(driver, "Cadastro enviado");

    await alerta.deveExibir(dados.alertaCadastro);
    await evidencia(driver, "Cadastro realizado");
    await alerta.confirmar();
    await login.devePermanecerNaTela();
  });

  test.describe("Cenários negativos", { tag: "@negativo" }, () => {
    for (const caso of dados.cadastrosInvalidos) {
      test(`bloqueia cadastro com ${caso.descricao}`, async ({ driver }) => {
        await login.cadastrar(caso);

        await login.deveExibirSomenteErros(caso.erros.map((e) => dados.mensagens[e]), todasAsMensagens);
        await alerta.naoDeveAparecerDurante();
        await evidencia(driver, `Cadastro bloqueado: ${caso.descricao}`);
      });
    }
  });
});
