// TAREFA 1: navegação pelas telas do app, validando o conteúdo de cada uma
const { test } = require("../support/fixtures");
const { MenuInferior } = require("../screens/MenuInferior");
const { telas } = require("../data/navegacao.json");
const { evidencia } = require("../support/evidencia");

test.describe("Navegação pela barra de abas", { tag: "@positivo" }, () => {
  for (const destino of telas) {
    test(`abre a aba ${destino.aba} e exibe a tela correta`, async ({ driver }) => {
      const menu = new MenuInferior(driver);
      // O app abre na Home: para testar a aba Home, sai dela primeiro
      if (destino.aba === "Home") await menu.abrir("Forms");

      await menu.abrir(destino.aba);

      await menu.deveExibirTela(destino);
      await evidencia(driver, `Tela ${destino.aba}`);
    });
  }

  test("percorre todas as abas em sequência sem travar", async ({ driver }) => {
    const menu = new MenuInferior(driver);
    for (const destino of [...telas.slice(1), telas[0]]) {
      await menu.abrir(destino.aba);
      await menu.deveExibirTela(destino);
    }
    await evidencia(driver, "Volta para a Home após percorrer as abas");
  });
});
