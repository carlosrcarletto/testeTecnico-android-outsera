const { test, expect } = require("@playwright/test");
const { BaseScreen } = require("./BaseScreen");
const { porAcessibilidade, porTexto } = require("../support/locators");

// Barra de abas na parte de baixo do app (Home, Web, Login, Forms, Swipe, Drag, Menu).
// Cada aba tem accessibility id igual ao seu nome.
class MenuInferior extends BaseScreen {
  async abrir(aba) {
    await test.step(`Abrir a aba "${aba}"`, async () => {
      await this.tocar(porAcessibilidade(aba));
    });
  }

  // Confere que a tela certa abriu: o contêiner da tela (accessibility id
  // "<Nome>-screen") e os textos que identificam o conteúdo estão visíveis.
  async deveExibirTela({ tela, textos = [] }) {
    await test.step(`Verificar a tela "${tela}"`, async () => {
      await this.aguardarVisivel(porAcessibilidade(tela));
      for (const texto of textos) {
        expect(await this.estaVisivelDepoisDeAguardar(porTexto(texto)), `texto "${texto}" na tela`).toBe(true);
      }
    });
  }

  async estaVisivelDepoisDeAguardar(seletor) {
    return this.aguardarVisivel(seletor)
      .then(() => true)
      .catch(() => false);
  }
}

module.exports = { MenuInferior };
