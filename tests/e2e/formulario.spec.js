// TAREFA 2: preencher o formulário da tela Forms e enviar os dados
const { test, expect } = require("../support/fixtures");
const { MenuInferior } = require("../screens/MenuInferior");
const { FormsScreen } = require("../screens/FormsScreen");
const { AlertaNativo } = require("../screens/AlertaNativo");
const dados = require("../data/formulario.json");
const { evidencia } = require("../support/evidencia");

test.describe("Formulário (tela Forms)", () => {
  let forms;
  let alerta;

  test.beforeEach(async ({ driver }) => {
    forms = new FormsScreen(driver);
    alerta = new AlertaNativo(driver);
    await new MenuInferior(driver).abrir("Forms");
    await forms.deveEstarVisivel();
  });

  test.describe("Cenários positivos", { tag: "@positivo" }, () => {
    test("preenche todos os campos e envia o formulário", async ({ driver }) => {
      await test.step("Estado inicial: campo vazio e chave desligada", async () => {
        await forms.deveExibirTextoDigitado("");
        await forms.deveEstarComChave(dados.chave.desligada);
      });

      await forms.digitarTexto(dados.texto);
      await forms.deveExibirTextoDigitado(dados.texto);
      await forms.alternarChave();
      await forms.deveEstarComChave(dados.chave.ligada);
      await forms.selecionarOpcao(dados.opcaoEscolhida);
      await forms.deveTerOpcaoSelecionada(dados.opcaoEscolhida);
      await evidencia(driver, "Formulário preenchido");

      await forms.enviar();
      await alerta.deveExibir(dados.alertaEnvio);
      await evidencia(driver, "Alerta de envio");
      await alerta.confirmar();

      await test.step("Dados continuam preenchidos após o envio", async () => {
        await forms.deveExibirTextoDigitado(dados.texto);
        await forms.deveEstarComChave(dados.chave.ligada);
        await forms.deveTerOpcaoSelecionada(dados.opcaoEscolhida);
      });
    });

    test("cancelar no alerta de envio fecha o alerta sem perder os dados", async ({ driver }) => {
      await forms.digitarTexto(dados.texto);
      await forms.enviar();
      await alerta.deveExibir(dados.alertaEnvio);
      await alerta.cancelar();

      await forms.deveExibirTextoDigitado(dados.texto);
      await evidencia(driver, "Envio cancelado, dados mantidos");
    });

    for (const opcao of dados.opcoes) {
      test(`lista suspensa permite selecionar "${opcao}"`, async ({ driver }) => {
        await forms.selecionarOpcao(opcao);

        await forms.deveTerOpcaoSelecionada(opcao);
        await evidencia(driver, `Opção "${opcao}"`);
      });
    }

    test("chave liga e desliga a cada toque", async ({ driver }) => {
      await forms.alternarChave();
      await forms.deveEstarComChave(dados.chave.ligada);
      await forms.alternarChave();
      await forms.deveEstarComChave(dados.chave.desligada);
      await evidencia(driver, "Chave desligada novamente");
    });
  });

  test.describe("Cenários negativos e limites", { tag: "@negativo" }, () => {
    test(`campo de texto aceita no máximo ${dados.limiteCaracteres} caracteres`, async ({ driver }) => {
      await forms.digitarTexto(dados.textoLongo);

      const esperado = dados.textoLongo.slice(0, dados.limiteCaracteres);
      await forms.deveExibirTextoDigitado(esperado);
      expect((await forms.textoExibido()).length, "quantidade de caracteres aceitos").toBe(dados.limiteCaracteres);
      await evidencia(driver, "Texto cortado no limite");
    });

    test("botão Inactive não envia o formulário", async ({ driver }) => {
      await forms.digitarTexto(dados.texto);
      await forms.tocarBotaoInativo();

      await alerta.naoDeveAparecerDurante(2000);
      await forms.deveEstarVisivel();
      await evidencia(driver, "Botão inativo não reagiu");
    });
  });
});
