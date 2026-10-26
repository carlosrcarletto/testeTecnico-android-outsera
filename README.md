# Testes automatizados mobile — Android com Appium + Playwright

Testes de interface (E2E) que abrem um aplicativo Android num emulador (ou celular) de verdade e verificam:

- **Tarefa 1:** login, navegação entre telas e validação de elementos (mensagens, textos e botões);
- **Tarefa 2:** preenchimento e envio de formulários (tela *Forms* e cadastro *Sign up*), incluindo validações e limites dos campos.

O app testado é o [**WebdriverIO Native Demo App**](https://github.com/webdriverio/native-demo-app) (v2.2.0), um app de exemplo feito para automação. O APK é baixado automaticamente na primeira execução.

Ferramentas usadas:

- [**Appium 3**](https://appium.io/) + driver **UiAutomator2**: controla o app Android (toca, digita, lê elementos nativos).
- [**WebdriverIO**](https://webdriver.io/): cliente que envia os comandos do teste para o Appium.
- [**Playwright Test**](https://playwright.dev/docs/test-intro): executor dos testes, asserções, fixtures e relatório HTML. A arquitetura é a mesma do projeto web.
- [**Allure Report**](https://allurereport.org/): relatório visual com cada passo, prints e vídeos da tela do aparelho.
- **GitHub Actions**: sobe um emulador Android, roda os testes a cada push e publica o relatório no GitHub Pages.

> **Por que Appium *e* Playwright?** O Playwright não automatiza apps Android nativos (o suporte a Android dele é experimental e só cobre o Chrome e WebViews). Por isso o **Appium controla o aparelho**, e o **Playwright Test organiza e executa os testes**: `describe`, `beforeEach`, fixtures, tags, `expect`, retries e relatórios ficam iguais aos do projeto web.

**Resumo dos cenários** (detalhes na [seção 5.1](#51-detalhe-de-cada-arquivo)):

| Arquivo | Tarefa | Positivos | Negativos / limites |
|---|---|---|---|
| `login.spec.js` | 1: login + navegação + validação | 1 | 3 |
| `navegacao.spec.js` | 1: navegação pelas telas | 6 | — |
| `formulario.spec.js` | 2: formulário da tela Forms | 6 | 2 |
| `cadastro.spec.js` | 2: formulário de cadastro | 1 | 3 |
| **Total** | | **14** | **8** |

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalação](#2-instalação)
3. [Rodando os testes](#3-rodando-os-testes)
4. [Vendo os relatórios](#4-vendo-os-relatórios)
5. [Estrutura do projeto](#5-estrutura-do-projeto)
6. [Como os testes são organizados (Screen Objects)](#6-como-os-testes-são-organizados-screen-objects)
7. [Locators nativos](#7-locators-nativos)
8. [Boas práticas aplicadas](#8-boas-práticas-aplicadas)
9. [Guia de manutenção](#9-guia-de-manutenção)
10. [CI/CD (GitHub Actions)](#10-cicd-github-actions)
11. [Problemas comuns](#11-problemas-comuns)

---

## 1. Pré-requisitos

| Programa | Para que serve | Como verificar |
|---|---|---|
| **Node.js** 20.19 ou superior ([download](https://nodejs.org/)) | Executa os testes e o Appium 3 | `node -v` |
| **Java** 17 ([download](https://adoptium.net/)) | Ferramentas do Android e geração do relatório Allure | `java -version` |
| **Android Studio** ([download](https://developer.android.com/studio)) | Instala o Android SDK e cria o emulador | — |
| **Git** ([download](https://git-scm.com/)) | Baixar e versionar o projeto | `git --version` |
| **Appium Inspector** (opcional, [download](https://github.com/appium/appium-inspector/releases)) | Inspecionar elementos do app e descobrir locators | — |

### 1.1 Configurar o Android SDK

Depois de instalar o Android Studio, defina a variável `ANDROID_HOME` apontando para o SDK e coloque as ferramentas no `PATH`:

| Sistema | Onde fica o SDK (padrão) | Configuração |
|---|---|---|
| macOS | `~/Library/Android/sdk` | No `~/.zshrc`: `export ANDROID_HOME=$HOME/Library/Android/sdk` e `export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator` |
| Linux | `~/Android/Sdk` | No `~/.bashrc`: `export ANDROID_HOME=$HOME/Android/Sdk` e o mesmo `PATH` acima |
| Windows | `%LOCALAPPDATA%\Android\Sdk` | *Painel de Controle → Variáveis de ambiente*: crie `ANDROID_HOME` e adicione `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\emulator` ao `Path` |

Feche e abra o terminal e confira com `adb version`.

### 1.2 Criar o emulador

No Android Studio: **More Actions → Virtual Device Manager → Create Device → Pixel 6 → API 34 (Android 14)**. Use uma imagem **x86_64** (ou **arm64** em Mac com Apple Silicon).

Também dá para usar um **celular Android de verdade**: ative *Opções do desenvolvedor → Depuração USB*, conecte no computador e aceite a autorização.

## 2. Instalação

```bash
git clone https://github.com/SEU-USUARIO/teste-tecnico-mobile-appium.git
cd teste-tecnico-mobile-appium
npm install
npm run preparar
```

O `npm run preparar` faz duas coisas, uma única vez: baixa o APK do app (~120 MB) para `apps/` e instala o driver **UiAutomator2** do Appium. Se você esquecer, o `npm test` faz isso sozinho.

## 3. Rodando os testes

1. **Ligue o emulador** (pelo Android Studio, ou `emulator -avd NOME_DO_EMULADOR`) ou conecte o celular.
2. Confira que o aparelho aparece: `adb devices` deve listar um item com status `device`.
3. Rode:

| Comando | O que faz |
|---|---|
| `npm test` | Sobe o Appium, instala o app no aparelho e roda todos os testes |
| `npx playwright test tests/e2e/login.spec.js` | Roda só um arquivo |
| `npx playwright test -g "formulário"` | Roda só os testes cujo nome contém o texto |
| `npx playwright test --grep @positivo` | Só positivos (`@negativo` para os negativos) |
| `npx playwright test --ui` | Interface visual do Playwright para escolher e repetir testes |
| `npm run appium` | Sobe **só o Appium** (útil para usar o Appium Inspector) |

Não é preciso subir o Appium à mão: o `playwright.config.js` sobe e derruba o servidor sozinho (opção `webServer`). Se ele já estiver rodando (por exemplo, para o Inspector), é reaproveitado.

Com mais de um aparelho conectado, escolha qual usar: `UDID=emulator-5554 npm test` (o UDID aparece no `adb devices`).

Resultado esperado no terminal (resumido):

```
Running 22 tests using 1 worker
  ✓  … › Login e navegação › Cenários positivos › faz login com credenciais válidas, navega pelas telas e valida os elementos @positivo
  ✓  … › Login e navegação › Cenários negativos › recusa login com e-mail sem @ @negativo
  ✓  … › Navegação pela barra de abas › abre a aba Forms e exibe a tela correta @positivo
  ✓  … › Formulário (tela Forms) › Cenários positivos › preenche todos os campos e envia o formulário @positivo
  ✓  … › Formulário de cadastro (Sign up) › Cenários negativos › bloqueia cadastro com confirmação diferente da senha @negativo
  22 passed
```

> A **primeira execução é mais lenta** (1 a 3 minutos a mais): o Appium instala no aparelho o app e o servidor do UiAutomator2. Nas seguintes, a sessão abre em segundos.

## 4. Vendo os relatórios

Não abra o `index.html` com duplo clique (a página fica em branco). Use os comandos:

```bash
npm run allure:serve        # relatório Allure da última execução (principal)
npx playwright show-report  # relatório HTML do Playwright
```

| Comando | O que faz |
|---|---|
| `npm run test:allure` | Roda os testes **e** gera o relatório em `allure-report/` |
| `npm run allure:generate` | Gera o relatório a partir de `allure-results/` |
| `npm run allure:open` | Abre um relatório já gerado |

O que olhar no Allure:

- **Overview**: totais, duração e o ambiente (plataforma, app, versão do Appium, aparelho).
- **Suites**: cada teste com os passos em português (`Fazer login com "…"`, `Verificar alerta "Success: You are logged in!"`…) e os anexos:
  - **Evidência: …**: prints da tela do aparelho nos momentos importantes (formulário preenchido, mensagem de erro, alerta de sucesso);
  - **screenshot**: print ao final de cada teste;
  - **video**: gravação da tela do aparelho durante o teste inteiro (`.mp4`);
  - **hierarquia-da-tela.xml**: só quando o teste falha. É a árvore de elementos que o Appium enxergava no momento da falha, ótima para descobrir se um locator mudou.
- **Behaviors / Tags**: filtre por `positivo` e `negativo`.

Nos cenários negativos, o relatório mostra a falha esperada: o print traz a mensagem de validação do app, e os passos registram que nenhum alerta de sucesso apareceu.

## 5. Estrutura do projeto

```
teste-tecnico-mobile-appium/
├── .github/workflows/
│   └── mobile.yml              → pipeline: emulador Android + testes + relatório no Pages
├── apps/                       → APK do app (baixado automaticamente, não versionado)
├── scripts/
│   └── preparar-ambiente.js    → baixa o APK e instala o driver UiAutomator2
├── tests/
│   ├── e2e/
│   │   ├── login.spec.js       → TAREFA 1: login, navegação e validação de elementos
│   │   ├── navegacao.spec.js   → TAREFA 1: cada aba abre a tela certa
│   │   ├── formulario.spec.js  → TAREFA 2: preencher e enviar o formulário da tela Forms
│   │   └── cadastro.spec.js    → TAREFA 2: formulário de cadastro (Sign up)
│   ├── screens/                → Screen Objects (o "Page Object" do mobile)
│   │   ├── BaseScreen.js       → ações comuns: esperar, tocar, digitar, rolar
│   │   ├── MenuInferior.js     → barra de abas e verificação da tela aberta
│   │   ├── LoginScreen.js      → login, cadastro e mensagens de validação
│   │   ├── FormsScreen.js      → campo de texto, chave, lista suspensa e botões
│   │   └── AlertaNativo.js     → caixa de diálogo nativa do Android
│   ├── data/
│   │   ├── login.json          → usuário, mensagens esperadas e casos inválidos
│   │   ├── formulario.json     → textos, opções da lista e alerta de envio
│   │   └── navegacao.json      → abas e o que cada tela deve exibir
│   └── support/
│       ├── capabilities.js     → app, servidor Appium e capabilities da sessão
│       ├── fixtures.js         → entrega o "driver" aos testes + vídeo e prints
│       ├── locators.js         → construtores de locators nativos
│       └── evidencia.js        → print de evidência anexado ao relatório
├── playwright.config.js
├── package.json
└── README.md
```

Pastas geradas automaticamente (não versionadas): `node_modules/`, `test-results/`, `playwright-report/`, `allure-results/`, `allure-report/` e o arquivo `appium.log`.

### 5.1 Detalhe de cada arquivo

#### `tests/e2e/login.spec.js`: Tarefa 1

| Cenário | O que verifica |
|---|---|
| ✅ faz login com credenciais válidas, navega pelas telas e valida os elementos | Login → alerta **“Success / You are logged in!”** → OK → tela **Forms** (título e botões *Active*/*Inactive*) → tela **Swipe** → volta à **Home** (textos “WEBDRIVER” e “Demo app for the appium-boilerplate”) |
| 🚫 recusa login com e-mail sem @ | Mensagem “Please enter a valid email address”, só ela, e nenhum alerta |
| 🚫 recusa login com senha com menos de 8 caracteres | Mensagem “Please enter at least 8 characters” |
| 🚫 recusa login com campos vazios | As duas mensagens |

#### `tests/e2e/navegacao.spec.js`: Tarefa 1

Para cada aba (**Home, Login, Forms, Swipe, Drag**), toca na aba e confere o contêiner da tela (accessibility id `<Nome>-screen`) e os textos que a identificam. Um sexto teste percorre todas as abas em sequência. Os dados vêm de `navegacao.json`.

#### `tests/e2e/formulario.spec.js`: Tarefa 2

| Cenário | O que verifica |
|---|---|
| ✅ preenche todos os campos e envia o formulário | Estado inicial (campo vazio, chave desligada) → digita o texto e confere o eco “You have typed” → liga a chave e confere o estado e o texto → escolhe uma opção na lista → toca **Active** → alerta **“This button is / This button is active”** → OK → os dados continuam preenchidos |
| ✅ cancelar no alerta fecha o alerta sem perder os dados | Botão *Cancel* do alerta |
| ✅ lista suspensa permite selecionar … (3 testes) | Cada uma das 3 opções |
| ✅ chave liga e desliga a cada toque | Liga, confere, desliga, confere |
| 🚫 campo de texto aceita no máximo 30 caracteres | Digita 47 caracteres, só os 30 primeiros são aceitos |
| 🚫 botão Inactive não envia o formulário | Nenhum alerta aparece |

#### `tests/e2e/cadastro.spec.js`: Tarefa 2

| Cenário | O que verifica |
|---|---|
| ✅ cadastra usuário com dados válidos | Alerta **“Signed Up! / You successfully signed up!”** |
| 🚫 bloqueia cadastro com confirmação diferente da senha | “Please enter the same password” |
| 🚫 bloqueia cadastro com e-mail inválido | “Please enter a valid email address”, só ela |
| 🚫 bloqueia cadastro com todos os campos vazios | As três mensagens |

Em todo cenário negativo os testes conferem **quais** mensagens aparecem e **quais não** aparecem, e garantem que nenhum alerta de sucesso surgiu.

#### `tests/support/fixtures.js`: o driver dos testes

Estende o Playwright Test com dois fixtures:

| Fixture | Escopo | O que faz |
|---|---|---|
| `sessao` | Um por worker | Abre a sessão no Appium (caro: instala app e servidor) e a reaproveita entre os testes |
| `driver` | Um por teste | **Fecha e reabre o app** (cada teste começa do zero), inicia a gravação de vídeo e, no final, anexa print, vídeo e, se falhou, a hierarquia da tela |

Os testes só pedem `{ driver }`, como os testes web pedem `{ page }`.

#### `tests/support/capabilities.js`

| Capability | Valor | Por quê |
|---|---|---|
| `automationName` | `UiAutomator2` | Driver oficial para Android |
| `app` | `apps/…v2.2.0.apk` | Instala o app automaticamente |
| `appPackage` / `appActivity` | `com.wdiodemoapp` / `.MainActivity` | Usados para fechar e reabrir o app entre os testes |
| `autoGrantPermissions` | `true` | Aceita permissões sem diálogos inesperados |
| `hideKeyboard` | `true` | Mantém o teclado escondido: ele não cobre botões e não é preciso fechá-lo nos testes |
| `*Timeout` | 120 a 180 s | Primeira instalação no emulador do CI é lenta |

Variáveis de ambiente aceitas: `UDID` (aparelho específico), `DEVICE_NAME`, `APPIUM_HOST` e `APPIUM_PORT`.

#### `playwright.config.js`

| Opção | Valor | Significado |
|---|---|---|
| `workers` | `1` | Um aparelho executa um teste por vez |
| `timeout` | 120 s | Testes mobile são mais lentos que web |
| `expect.timeout` | 15 s | Tempo máximo das esperas com `expect.poll` |
| `retries` | 1 no CI, 0 local | Uma repetição no CI para instabilidades do emulador |
| `webServer` | `npm run appium` | Prepara o ambiente e sobe o Appium antes dos testes |
| `reporter` | `list`, `html`, `allure-playwright` | Saída no terminal + os dois relatórios |

## 6. Como os testes são organizados (Screen Objects)

O padrão é o mesmo **Page Object Model** do projeto web, aqui chamado de **Screen Object**: cada tela do app vira uma classe em `tests/screens/`.

```
formulario.spec.js ──usa──▶ FormsScreen.selecionarOpcao("Appium is awesome")
        │                        └─ sabe que a lista é  ~Dropdown
        │                           e que a opção fica num ListView nativo
        └──usa──▶ AlertaNativo.deveExibir({ titulo, mensagem })
                                 └─ sabe que o título é  android:id/alertTitle
```

- **Locators e ações** → classes de `screens/` (herdam de `BaseScreen`).
- **Cenários (o que testar)** → arquivos `.spec.js`.
- **Dados** → `data/`.

Se o app mudar um identificador, você corrige **uma linha** na tela correspondente e todos os testes voltam a funcionar.

## 7. Locators nativos

Os testes usam **apenas locators nativos**, sem XPath:

| Estratégia | Exemplo | Quando usar |
|---|---|---|
| **Accessibility id** (`~`) | `~input-email`, `~button-LOGIN`, `~Forms` | **Primeira opção.** Definido pelo time do app (`accessibilityLabel`), estável e igual no Android e no iOS |
| **UiSelector por texto** | `android=new UiSelector().text("Please enter a valid email address")` | Validar mensagens e textos exibidos |
| **UiSelector por resource-id** | `android=new UiSelector().resourceIdMatches(".*:id/alertTitle")` | Componentes do próprio Android (alertas, botões de diálogo) |
| **UiSelector com hierarquia** | `…className("android.widget.ListView").childSelector(new UiSelector().text("…"))` | Opções dentro de listas nativas |

**Por que evitar XPath:** o Appium precisa montar a árvore inteira da tela em XML e percorrê-la a cada busca, o que é lento. Além disso, caminhos como `//android.view.ViewGroup[3]/android.widget.TextView[2]` quebram com qualquer mudança de layout. O `UiSelector` roda dentro do aparelho, direto no UiAutomator.

Os construtores ficam em `tests/support/locators.js` (`porAcessibilidade`, `porTexto`, `porResourceId`…), o que deixa os Screen Objects legíveis.

## 8. Boas práticas aplicadas

- **Sem esperas fixas** para encontrar elementos: `waitForDisplayed` e `expect.poll` esperam só o necessário. A única espera fixa é proposital: garantir que um alerta **não** aparece, já que o app leva ~1,5 s para mostrá-lo (método `naoDeveAparecerDurante`).
- **Cada teste começa do zero**: o app é fechado e reaberto antes de cada teste, então os testes não dependem uns dos outros.
- **Sessão reaproveitada**: abrir uma sessão do Appium é caro; ela é aberta uma vez por worker.
- **Teclado sempre escondido** (`hideKeyboard`): elimina a causa mais comum de instabilidade em testes mobile (o teclado cobrindo o botão).
- **Rolagem só quando necessário** (`rolarAte`): funciona em telas pequenas e grandes sem mudar o teste.
- **Data-driven**: casos de login, cadastro, navegação e opções da lista vêm dos JSONs; um novo item vira um novo teste.
- **Validações completas**: título e mensagem exatos dos alertas, mensagens que devem e não devem aparecer, estado da chave pelo atributo `checked`, limite de caracteres.
- **Evidências em todos os testes**: prints nomeados, vídeo e, nas falhas, a hierarquia da tela.
- **Passos legíveis**: cada ação vira um `test.step` em português no relatório.

## 9. Guia de manutenção

### 9.1 Um teste começou a falhar. E agora?

1. Abra o relatório (`npm run allure:serve`): veja **em qual passo** falhou, o **print**, o **vídeo** e a **hierarquia-da-tela.xml**.
2. Causas mais comuns:
   - **O app mudou um identificador** → procure o elemento na hierarquia (ou no Appium Inspector) e atualize o locator na classe de `screens/`.
   - **O texto de uma mensagem mudou** → atualize em `data/`.
   - **Emulador lento** → rode de novo; se persistir, aumente os timeouts em `playwright.config.js`.

### 9.2 Descobrir um locator com o Appium Inspector

1. Com o emulador ligado, rode `npm run appium` em um terminal.
2. Abra o Appium Inspector, com **Remote Host** `127.0.0.1`, **Port** `4723` e **Remote Path** `/`.
3. Cole as capabilities:

```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.wdiodemoapp",
  "appium:appActivity": ".MainActivity",
  "appium:noReset": true
}
```

4. Clique em **Start Session**, toque no elemento na imagem e copie o **accessibility id** (campo `content-desc`). Se não houver, use o `text` ou o `resource-id` num `UiSelector`.

### 9.3 Criar um novo teste

Exemplo: verificar que a tela Swipe mostra o carrossel.

1. Crie a tela em `tests/screens/SwipeScreen.js`:

```js
const { BaseScreen } = require("./BaseScreen");
const { porAcessibilidade } = require("../support/locators");

class SwipeScreen extends BaseScreen {
  async deveExibirCarrossel() {
    await this.aguardarVisivel(porAcessibilidade("Carousel"));
  }
}

module.exports = { SwipeScreen };
```

2. Use no teste:

```js
test("exibe o carrossel na tela Swipe", async ({ driver }) => {
  await new MenuInferior(driver).abrir("Swipe");
  await new SwipeScreen(driver).deveExibirCarrossel();
  await evidencia(driver, "Carrossel");
});
```

3. Rode: `npx playwright test -g "carrossel"`.

> Dentro das classes use sempre `this.driver` (nunca `driver` sozinho).

### 9.4 Testar outro app

Troque `APP` em `tests/support/capabilities.js` (URL do APK, pacote e atividade) e crie as telas do novo app em `screens/`. A estrutura (fixtures, evidências, relatórios, CI) continua igual.

### 9.5 Testar em iOS

A arquitetura suporta iOS: os accessibility ids deste app são os mesmos nas duas plataformas. Seria preciso um Mac com Xcode, o driver `xcuitest` e as capabilities de iOS. Os locators `android=` teriam equivalentes `-ios predicate string`.

## 10. CI/CD (GitHub Actions)

O arquivo `.github/workflows/mobile.yml` roda em todo push e pull request para a `main` (ou manualmente na aba **Actions**):

```
push / pull request / "Run workflow"
            │
            ▼
┌──────────────────────────────────────┐        ┌───────────────────────────────┐
│ test (CI)                            │  só na │ deploy-report (CD)            │
│ KVM → npm ci → APK (cache) → driver  │ ─main─▶│ publica o relatório Allure no │
│ → emulador Pixel 6 / API 34 → testes │        │ GitHub Pages                  │
└──────────────────────────────────────┘        └───────────────────────────────┘
```

Passos do job `test`:

1. Instala Node.js e Java 17.
2. **Habilita o KVM**, a aceleração de hardware sem a qual o emulador fica lento demais.
3. `npm ci` e, com o APK guardado em **cache** entre execuções, `npm run preparar` (driver UiAutomator2).
4. Sobe um **emulador Android (Pixel 6, API 34)** com a action [`reactivecircus/android-emulator-runner`](https://github.com/ReactiveCircus/android-emulator-runner), com animações desligadas para mais estabilidade, e roda `npx playwright test`.
5. Gera o Allure e publica `playwright-report`, `allure-report` e `appium.log` como **artifacts** (30 dias), **mesmo se algum teste falhar**.
6. Na `main`, publica o relatório Allure no GitHub Pages.

A execução completa leva cerca de 10 a 15 minutos, sendo boa parte disso a inicialização do emulador.

**Configuração única do GitHub Pages:** no repositório, **Settings → Pages → Source: GitHub Actions**. Sem isso o job `deploy-report` falha com `status: 404`; depois de ativar, use **Re-run failed jobs**. O relatório fica em `https://SEU-USUARIO.github.io/teste-tecnico-mobile-appium/`.

> Repositórios **públicos** usam os runners do GitHub de graça. Em repositórios privados, o tempo de emulador consome os minutos do plano.

## 11. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported` | SDK do Android não configurado | Seção 1.1; feche e abra o terminal |
| `Could not find a connected Android device` | Emulador desligado ou celular não autorizado | Ligue o emulador; `adb devices` deve mostrar `device` |
| `Could not find a driver for automationName 'UiAutomator2'` | Driver não instalado | `npm run preparar` |
| `Elemento não apareceu na tela: ~…` | Locator mudou ou a tela não abriu | Veja a `hierarquia-da-tela.xml` no relatório (seção 9.1) |
| Teste lento ou timeout na primeira execução | Instalação do app e do UiAutomator2 no aparelho | Normal na primeira vez; rode de novo |
| `Error: http://127.0.0.1:4723/status is already used` | Outro Appium aberto | Feche-o, ou deixe aberto (localmente ele é reaproveitado) |
| Vídeo ausente no relatório | O aparelho não suporta gravação de tela | Os prints continuam sendo anexados |
| `unsupported Node.js version` | Appium 3 exige Node 20.19+ | Atualize o Node |
| Relatório abre em branco | Abriu o `index.html` direto | `npm run allure:serve` ou `npx playwright show-report` |
| Job `deploy-report` falha com `status: 404` | GitHub Pages não ativado | Settings → Pages → Source: **GitHub Actions** |
