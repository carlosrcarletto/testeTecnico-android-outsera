const { test, expect } = require("@playwright/test");
const { BaseScreen } = require("./BaseScreen");
const { porResourceId, porResourceIdExato } = require("../support/locators");

// Caixa de diálogo nativa do Android (Alert do React Native → AlertDialog).
// Os ids são do próprio Android, então valem para qualquer app.
//   button1 = botão positivo (OK) · button2 = negativo (Cancel) · button3 = neutro
const SEL = {
  titulo: porResourceId("alertTitle"),
  mensagem: porResourceId("message"),
  positivo: porResourceIdExato("android:id/button1"),
  negativo: porResourceIdExato("android:id/button2"),
  neutro: porResourceIdExato("android:id/button3"),
};

class AlertaNativo extends BaseScreen {
  async deveExibir({ titulo, mensagem }) {
    await test.step(`Verificar alerta "${titulo}: ${mensagem}"`, async () => {
      // O login simula uma chamada de API de ~1,5 s antes do alerta: espera dinâmica
      expect(await this.texto(SEL.titulo), "título do alerta").toBe(titulo);
      expect(await this.texto(SEL.mensagem), "mensagem do alerta").toBe(mensagem);
    });
  }

  async confirmar() {
    await test.step("Tocar em OK no alerta", async () => {
      await this.tocar(SEL.positivo);
      await this.aguardarSumir(SEL.titulo);
    });
  }

  async cancelar() {
    await test.step("Tocar em Cancel no alerta", async () => {
      await this.tocar(SEL.negativo);
      await this.aguardarSumir(SEL.titulo);
    });
  }

  async estaAberto() {
    return this.estaVisivel(SEL.titulo);
  }

  // Garante que NENHUM alerta aparece durante a janela informada. Aqui uma espera
  // fixa é proposital: o app leva ~1,5 s para mostrar o alerta de sucesso, então só
  // dá para afirmar que ele não veio depois desse tempo.
  async naoDeveAparecerDurante(ms = 2500) {
    await test.step(`Garantir que nenhum alerta aparece em ${ms / 1000} s`, async () => {
      const titulo = await this.el(SEL.titulo);
      const apareceu = await titulo
        .waitForDisplayed({ timeout: ms })
        .then(() => true)
        .catch(() => false);
      expect(apareceu, "nenhum alerta deveria ter aparecido").toBe(false);
    });
  }
}

module.exports = { AlertaNativo };
