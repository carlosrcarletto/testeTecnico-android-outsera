// Ações comuns a todas as telas. As telas (Screen Objects) herdam desta classe e
// guardam só os locators e as ações específicas de cada uma.
class BaseScreen {
  constructor(driver) {
    this.driver = driver;
  }

  el(seletor) {
    return this.driver.$(seletor);
  }

  // Espera o elemento aparecer na tela (sem sleeps fixos) e o devolve
  async aguardarVisivel(seletor, timeout = 15_000) {
    const elemento = await this.el(seletor);
    await elemento.waitForDisplayed({ timeout, timeoutMsg: `Elemento não apareceu na tela: ${seletor}` });
    return elemento;
  }

  async aguardarSumir(seletor, timeout = 15_000) {
    const elemento = await this.el(seletor);
    await elemento.waitForDisplayed({ timeout, reverse: true, timeoutMsg: `Elemento continuou na tela: ${seletor}` });
  }

  async estaVisivel(seletor) {
    try {
      return await (await this.el(seletor)).isDisplayed();
    } catch {
      return false;
    }
  }

  async tocar(seletor) {
    const elemento = await this.aguardarVisivel(seletor);
    await elemento.click();
  }

  // setValue limpa o campo e digita; com string vazia, apenas limpa
  async digitar(seletor, texto) {
    const elemento = await this.aguardarVisivel(seletor);
    await elemento.clearValue();
    if (texto) await elemento.setValue(texto);
  }

  async texto(seletor) {
    const elemento = await this.aguardarVisivel(seletor);
    return elemento.getText();
  }

  // Rola a tela para baixo até o elemento ficar visível (no máximo N gestos).
  // Se ele já está visível, não rola: funciona em qualquer tamanho de tela.
  async rolarAte(seletor, maxGestos = 5) {
    for (let i = 0; i <= maxGestos; i++) {
      if (await this.estaVisivel(seletor)) return this.el(seletor);
      const { width, height } = await this.driver.getWindowSize();
      await this.driver.execute("mobile: scrollGesture", {
        left: Math.round(width * 0.1),
        top: Math.round(height * 0.25),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.5),
        direction: "down",
        percent: 0.7,
      });
    }
    throw new Error(`Elemento não encontrado mesmo rolando a tela: ${seletor}`);
  }
}

module.exports = { BaseScreen };
