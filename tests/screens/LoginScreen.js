const { test, expect } = require("@playwright/test");
const { BaseScreen } = require("./BaseScreen");
const { porAcessibilidade, porTexto } = require("../support/locators");

// Tela Login: tem duas abas internas, "Login" e "Sign up" (cadastro)
const SEL = {
  tela: porAcessibilidade("Login-screen"),
  abaLogin: porAcessibilidade("button-login-container"),
  abaCadastro: porAcessibilidade("button-sign-up-container"),
  email: porAcessibilidade("input-email"),
  senha: porAcessibilidade("input-password"),
  confirmacaoSenha: porAcessibilidade("input-repeat-password"),
  botaoEntrar: porAcessibilidade("button-LOGIN"),
  botaoCadastrar: porAcessibilidade("button-SIGN UP"),
};

class LoginScreen extends BaseScreen {
  async deveEstarVisivel() {
    await this.aguardarVisivel(SEL.tela);
    await this.aguardarVisivel(SEL.email);
  }

  async abrirCadastro() {
    await test.step("Abrir a aba Sign up (cadastro)", async () => {
      await this.tocar(SEL.abaCadastro);
      await this.aguardarVisivel(SEL.confirmacaoSenha);
    });
  }

  async entrar({ email, senha }) {
    await test.step(`Fazer login com "${email || "(vazio)"}"`, async () => {
      await this.digitar(SEL.email, email);
      await this.digitar(SEL.senha, senha);
      await (await this.rolarAte(SEL.botaoEntrar)).click();
    });
  }

  async cadastrar({ email, senha, confirmacao }) {
    await test.step(`Cadastrar "${email || "(vazio)"}"`, async () => {
      await this.digitar(SEL.email, email);
      await this.digitar(SEL.senha, senha);
      await this.digitar(SEL.confirmacaoSenha, confirmacao);
      await (await this.rolarAte(SEL.botaoCadastrar)).click();
    });
  }

  async deveExibirErro(mensagem) {
    await test.step(`Verificar mensagem de erro: "${mensagem}"`, async () => {
      await this.aguardarVisivel(porTexto(mensagem));
    });
  }

  // Confere exatamente quais mensagens de erro estão na tela (e que as outras não estão)
  async deveExibirSomenteErros(esperadas, todas) {
    for (const mensagem of esperadas) await this.deveExibirErro(mensagem);
    for (const mensagem of todas.filter((m) => !esperadas.includes(m))) {
      expect(await this.estaVisivel(porTexto(mensagem)), `não deveria exibir "${mensagem}"`).toBe(false);
    }
  }

  async devePermanecerNaTela() {
    await this.aguardarVisivel(SEL.tela);
  }
}

module.exports = { LoginScreen };
