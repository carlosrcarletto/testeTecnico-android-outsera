const { test, expect } = require("@playwright/test");
const { BaseScreen } = require("./BaseScreen");
const { porAcessibilidade, porClasse, opcaoDeLista } = require("../support/locators");

// Tela Forms: campo de texto, chave liga/desliga, lista suspensa e botões Active/Inactive
const SEL = {
  tela: porAcessibilidade("Forms-screen"),
  campoTexto: porAcessibilidade("text-input"),
  textoDigitado: porAcessibilidade("input-text-result"),
  chave: porAcessibilidade("switch"),
  textoChave: porAcessibilidade("switch-text"),
  listaSuspensa: porAcessibilidade("Dropdown"),
  botaoAtivo: porAcessibilidade("button-Active"),
  botaoInativo: porAcessibilidade("button-Inactive"),
};

class FormsScreen extends BaseScreen {
  async deveEstarVisivel() {
    await this.aguardarVisivel(SEL.tela);
    await this.aguardarVisivel(SEL.campoTexto);
  }

  async digitarTexto(texto) {
    await test.step(`Digitar "${texto}" no campo de texto`, async () => {
      await this.digitar(SEL.campoTexto, texto);
    });
  }

  async textoExibido() {
    return (await this.el(SEL.textoDigitado)).getText();
  }

  async deveExibirTextoDigitado(esperado) {
    await test.step(`Verificar texto digitado: "${esperado}"`, async () => {
      // poll: o React atualiza o texto logo depois da digitação, sem tempo fixo
      await expect.poll(() => this.textoExibido(), { message: "texto exibido abaixo do campo" }).toBe(esperado);
    });
  }

  async alternarChave() {
    await test.step("Tocar na chave (switch)", async () => {
      await this.tocar(SEL.chave);
    });
  }

  async chaveLigada() {
    return (await (await this.el(SEL.chave)).getAttribute("checked")) === "true";
  }

  async deveEstarComChave({ ligada, texto }) {
    await test.step(`Verificar chave ${ligada ? "ligada" : "desligada"}`, async () => {
      await expect.poll(() => this.chaveLigada(), { message: "estado da chave" }).toBe(ligada);
      expect(await this.texto(SEL.textoChave), "texto ao lado da chave").toBe(texto);
    });
  }

  async selecionarOpcao(opcao) {
    await test.step(`Selecionar "${opcao}" na lista suspensa`, async () => {
      await (await this.rolarAte(SEL.listaSuspensa)).click();
      await this.tocar(opcaoDeLista(opcao));
      await this.aguardarSumir(opcaoDeLista(opcao));
    });
  }

  // O valor escolhido aparece num campo de texto (somente leitura) dentro da lista
  async opcaoSelecionada() {
    const lista = await this.aguardarVisivel(SEL.listaSuspensa);
    return (await lista.$(porClasse("android.widget.EditText"))).getText();
  }

  async deveTerOpcaoSelecionada(opcao) {
    await test.step(`Verificar opção selecionada: "${opcao}"`, async () => {
      await expect.poll(() => this.opcaoSelecionada(), { message: "opção exibida na lista suspensa" }).toBe(opcao);
    });
  }

  async enviar() {
    await test.step("Tocar no botão Active (enviar)", async () => {
      await (await this.rolarAte(SEL.botaoAtivo)).click();
    });
  }

  async tocarBotaoInativo() {
    await test.step("Tocar no botão Inactive", async () => {
      await (await this.rolarAte(SEL.botaoInativo)).click();
    });
  }

  async deveExibirBotoes() {
    await test.step("Verificar botões Active e Inactive", async () => {
      await this.rolarAte(SEL.botaoAtivo);
      await this.aguardarVisivel(SEL.botaoInativo);
    });
  }
}

module.exports = { FormsScreen };
