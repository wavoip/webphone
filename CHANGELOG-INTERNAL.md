# Changelog interno

Para quem desenvolve o webphone. O que muda para quem **usa** a biblioteca está no
[CHANGELOG.md](./CHANGELOG.md).

## 2.0.0 — não lançada

### Framework

React saiu; SolidJS entrou. A consequência que mais muda o dia a dia: **o corpo do
componente roda uma vez.** Não há render para se proteger, então `useRef` vira variável
comum, `useCallback` e `useMemo` somem, e o que precisa ser reativo precisa ser **lido**
dentro do JSX — não destruturado antes.

Destruturar props ou um objeto de getters lê o valor uma vez e congela. É o erro mais
fácil de cometer aqui, e ele não dá erro: a tela só para de atualizar.

- `props.x` em vez de `const { x } = props`
- `splitProps` quando for preciso separar
- `<Show>` e `<For>` em vez de `&&` e `.map()`
- `class` em vez de `className`

### Estado

O `zustand` saiu; o estado do núcleo é `solid-js/store`. O corpo das slices não mudou — o
`set`/`get` que elas recebem tem a mesma forma, e o que caiu foi a anotação `StateCreator`.

**O `MiddlewareStoreApi` manteve `getState`/`setState`/`subscribe`**, então os effects e os
controllers não mudaram de assinatura. Duas diferenças que importam:

- `getState()` devolve um **proxy reativo**. Ler um campo dentro do JSX assina aquele
  campo; fora, é leitura comum.
- `subscribe(selector, listener)` entrega `(valor, anterior)`, e o `anterior` da primeira
  emissão é o valor de **quando se assinou** — não `undefined`. O `ringtoneEffect` depende
  disso para distinguir a primeira oferta de mais uma oferta.

Os sete seletores (`useCallState`, `useUiState`, …) morreram. `useStore()` devolve o estado
inteiro; agrupar só tinha valor porque o React assinava por componente.

### Providers

De nove para sete. Saíram:

- **`WavoipProvider`** — tudo que os oito consumidores tiravam dele era campo do store ou
  chamada de controller. Era ponte para o React.
- **`NotificationsProvider`** — provider vazio; o estado sempre esteve no store. Virou
  `lib/notifications.ts`.

Quem expõe estado agora expõe **acessor**, não valor: `isPiP()`, `isClosed()`. A janela do
Picture-in-Picture some sem passar pelo nosso código, e um booleano capturado mentiria.

### Componentes

Radix trocado por **Ark UI**, que compartilha as máquinas de estado do Zag entre React e
Solid. Isso permitiu trocar de biblioteca de primitivas **ainda em React** e validar foco,
teclado e shadow DOM antes de trocar de framework — dois riscos em sequência, e não
acoplados.

Diferenças que não eram óbvias:

- A aba ativa é `data-selected`, e não `data-state="active"`.
- O `Switch` tem um `Control` entre a raiz e o thumb; o `class` de quem usa vai para o
  `Control`, que é onde está o `data-state`.
- O conteúdo fica montado e escondido por padrão. `lazyMount` + `unmountOnExit` o tiram da
  árvore, mas **depois da transição** — testes que checavam remoção imediata precisam de um
  tick.
- O `Portal` vem do `solid-js/web`; o Ark não publica um para Solid.

Uma biblioteca de ícones só (`phosphor-solid`), atrás de `src/components/icons.ts`. Trocar
de pacote — ou inlinar os SVGs, que resolveria os seis pesos que o phosphor carrega — é
mexer num arquivo só.

### Delegação de evento

O Solid registra um ouvinte por tipo de evento numa raiz só e acha o `onClick` subindo a
árvore a partir de `event.target`. A raiz padrão é o `document` da página, e isso não cobre
nenhum dos dois lugares onde o webphone desenha:

- o **shadow root** do widget, porque o clique chega ao `document` já retargetado para o
  host — a árvore inteira fica inerte, e o React não tinha esse problema porque desde a 17
  ele escuta no container em que montou;
- a janela do **Picture-in-Picture**, que é outro documento.

`delegateEventsToRoot` (em `lib/event-delegation.ts`) é o dono dessa regra, e toda raiz fora
do `document` passa por ela. Registra a lista inteira do Solid em vez de só o que hoje se
usa: faltar um evento não quebra nada visível, só deixa aquele controle sem responder.

### `wavoip-api` v3

O status da chamada é **espelhado** da lib, não remontado aqui. A v3 tirou o evento `status`
de propósito e manteve o getter como fonte da verdade — ele está sempre atual dentro de
qualquer handler. Dez transições escritas à mão viraram uma linha.

Regra que vale para o resto: **não reescreva regra da lib.** Toda vez que o webphone tinha
cópia da máquina de estado, ela envelheceu — o comentário do `cancel` ainda citava
`IS_NOT_OFFER`, que a v3 renomeou.

`cancel()` tem **três** desfechos, não dois: `ok` (a lib já pôs `CANCELLED`),
`CALL_ALREADY_ANSWERED` (a chamada segue viva, espere o `accepted`) e `ACK_TIMEOUT` (não se
sabe, e a mídia foi mantida de propósito).

Os dublês em `FakeWavoip.ts` movem o status antes de resolver, como a lib. **Dublê que não
cumpre o contrato da lib faz o teste concordar com a suposição, não com a realidade.**

### Armadilhas encontradas traduzindo

Nenhuma destas tinha teste, e nenhuma apareceria numa tradução mecânica.

- `devices.sort(...)` ordenava o array **do estado**. Em React só reordenava; com store
  reativo é mutação durante o desenho. Ordene uma cópia.
- `hasWarnings` encadeava contagens com `&&`, exigindo todos os problemas ao mesmo tempo.
- O `connectionChanged` derivava status do payload, então parar a mídia virava "caiu" —
  inclusive quando era o próprio usuário desligando.
- `Badge` foi importado da biblioteca de ícones e usado envolvendo texto.
- O `WebPhone` tinha a escolha de tela escrita duas vezes, uma para a página e outra para a
  janela do PiP, sem nada garantindo que continuassem iguais — e o teclado ficava de fora
  da guarda, então abrir o PiP nele deixava dois montados.
- `{sinal() && <X/>}` solto entre os filhos de um provider assina aquele sinal no escopo que
  monta **todos** os filhos: mudar `isPiP()` refazia a árvore inteira abaixo do
  `WidgetProvider`, com `Toaster` e webphone junto. Dentro de `<Show>` a leitura fica no
  escopo do próprio `<Show>`.
- `useNotificationManager` devolvia a lista num getter, e o componente desestruturava —
  o array chegava congelado no primeiro estado. Quem expõe estado expõe acessor, e quem
  consome chama.

### Discagem

Quem percorre os devices é a lib. O `startCall` já tenta um por vez, e o
`startCallIterator` entrega cada recusa enquanto acontece — o webphone chamava
`startCall` uma vez por token, reimplementando por fora o laço que já existia dentro.

Sobrou `CallController.dial`, que consome o iterador e conta o andamento pelo store
(`dialStatus`, `dialError`, `dialIsLoading`); a tela só lê. O que continua sendo nosso é
a desistência.

Era regra de negócio numa tela: qual device tentar em seguida, o que fazer com cada
recusa, o que conta como desistência. E a tela é justamente o que remonta ao abrir e ao
fechar o Picture-in-Picture, porque muda de documento — razão de o `dialToken` viver no
store desde sempre.

### Testes

- O `renderWithProviders` espelha a árvore do `App`. Quando ela ficou para trás, o
  `DebugScreen` quebrou por falta de `DebugProvider` — e o erro apontava para a tela.
- Ele monta num `<div>` do documento, e não dentro do shadow root: o bug de delegação não
  reproduz ali, e o happy-dom também não retargeta `event.target` na borda do shadow root.
- `fireEvent.change` não alimenta mais nada: quem escreve no store é o `onInput`. Use
  `fireEvent.input`.
- O Ark monta e desmonta com transição; depois do clique, adiante o timer antes de
  afirmar que o conteúdo apareceu.
- O `phosphor-solid` não declara `exports` e o `main` dele é CJS, que faz
  `require("solid-js")` e carrega um **segundo Solid** — contexto e reatividade param de
  atravessar, e as máquinas do Ark nunca abrem. Os builds pegam o `module` sozinhos; o
  `vitest.config.ts` tem um alias para o ESM. Sai junto com o pacote, quando os SVGs forem
  inlinados.

### Build

- `pnpm build` produz `dist` (pacote npm, lib) e `dist-app` (PWA).
- O modo PWA tem config própria (`vite.app.config.ts`): build de aplicação, CSS em arquivo,
  sons como requisições, service worker.
- O `publicDir` está desligado no build do widget — `files` publica o `dist` inteiro, e sem
  isso os ícones do PWA entrariam no pacote.
- O Tailwind v4 varre a partir da raiz do Vite, que difere entre os dois modos. O `@source`
  no CSS fixa a fonte; sem ele o PWA saía **sem estilo nenhum**.
