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

### Picture-in-Picture

O Solid escuta evento uma vez no `document` e resolve o alvo pela árvore. A janela do PiP é
outro documento: sem `delegateEvents(eventos, pipWindow.document)` ela abre, desenha certo e
**não responde a nada**. A lista de eventos delegados está no `PipProvider`; faltar um ali
não quebra nada visível, só deixa aquele controle inerte dentro do PiP.

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

### Build

- `pnpm build` produz `dist` (pacote npm, lib) e `dist-app` (PWA).
- O modo PWA tem config própria (`vite.app.config.ts`): build de aplicação, CSS em arquivo,
  sons como requisições, service worker.
- O `publicDir` está desligado no build do widget — `files` publica o `dist` inteiro, e sem
  isso os ícones do PWA entrariam no pacote.
- O Tailwind v4 varre a partir da raiz do Vite, que difere entre os dois modos. O `@source`
  no CSS fixa a fonte; sem ele o PWA saía **sem estilo nenhum**.
