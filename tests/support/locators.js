// Construtores de locators NATIVOS do Android (sem XPath).
//  ~id               → accessibility id (content-desc). Estratégia preferida: estável,
//                      definida pelo time do app e igual entre Android e iOS.
//  android=UiSelector → busca nativa do UiAutomator2 (texto, resource-id, classe),
//                       executada dentro do aparelho: muito mais rápida que XPath.
const aspas = (texto) => JSON.stringify(String(texto)); // escapa aspas para o UiSelector

const porAcessibilidade = (id) => `~${id}`;
const porTexto = (texto) => `android=new UiSelector().text(${aspas(texto)})`;
const porResourceId = (id) => `android=new UiSelector().resourceIdMatches(${aspas(`.*:id/${id}`)})`;
const porResourceIdExato = (id) => `android=new UiSelector().resourceId(${aspas(id)})`;
const porClasse = (classe) => `android=new UiSelector().className(${aspas(classe)})`;
const opcaoDeLista = (texto) =>
  `android=new UiSelector().className("android.widget.ListView").childSelector(new UiSelector().text(${aspas(texto)}))`;

module.exports = { porAcessibilidade, porTexto, porResourceId, porResourceIdExato, porClasse, opcaoDeLista };
