---
description: Referência completa do objeto window.wavoip exposto pelo Webphone.
icon: brackets-curly
---

# API pública

Após o `render()`, o webphone disponibiliza sua API em dois lugares equivalentes:

* Como resolução da promise retornada por `webphone.render()`.
* No escopo global, em `window.wavoip`.

```ts
import webphone from "@wavoip/wavoip-webphone";

const api = await webphone.render();
// api === window.wavoip
```

A API é dividida em nove módulos:

| Módulo | Responsabilidade |
| --- | --- |
| [`call`](#call) | Iniciar chamadas, ler estado de chamada ativa, manipular o discador. |
| [`device`](#device) | Cadastrar, habilitar, desabilitar e remover dispositivos. |
| [`notifications`](#notifications) | Listar, adicionar, remover e marcar notificações como lidas. |
| [`widget`](#widget) | Abrir, fechar e reposicionar o botão flutuante. |
| [`theme`](#theme) | Trocar entre tema claro, escuro e do sistema. |
| [`position`](#position) | Reposicionar o painel do webphone. |
| [`settings`](#settings) | Mostrar/ocultar áreas da UI em tempo de execução. |
| [`on`](#on) | Assinar eventos do ciclo de vida (chamadas, ofertas). |
| [`use`](#use) | Registrar middleware estilo Express para interceptar/bloquear ofertas. |

{% hint style="info" %}
Todos os métodos de leitura retornam valores síncronos. Apenas `call.start` e `call.startCall` são assíncronos.
{% endhint %}

## `call`

Controla o ciclo de vida de chamadas.

### `start(to, config?)`

Inicia uma chamada para o número informado. Se `config.fromTokens` for omitido, o webphone escolhe automaticamente um dispositivo habilitado.

```ts
const { call, err } = await window.wavoip.call.start("5511999999999", {
  displayName: "Atendimento",
});

if (err) {
  console.error(err.message, err.devices);
  return;
}

console.log("call id:", call.id);
```

**Parâmetros**

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `to` | `string` | Número de destino (somente dígitos, com DDI). |
| `config.fromTokens` | `string[]` | Lista de tokens de dispositivos permitidos para originar a chamada. |
| `config.displayName` | `string` | Nome exibido ao destinatário. Sobrescreve `callSettings.displayName`. |

**Retorno**

```ts
| { call: { id: string; peer: CallPeer }; err: null }
| { call: null; err: { message: string; devices: { token: string; reason: string }[] } }
```

### ~~`startCall(to, fromTokens)`~~ (depreciado)

{% hint style="warning" %}
**Depreciado.** Use [`call.start(to, { fromTokens })`](#start-to-config) no lugar. `startCall` será removido em uma versão major futura e emite `console.warn` ao ser chamado.
{% endhint %}

Versão posicional de `start`, mantida apenas para compatibilidade retroativa. Equivalente a `start(to, { fromTokens })`.

```ts
// ❌ Depreciado
await window.wavoip.call.startCall("5511999999999", ["token-a"]);

// ✅ Use no lugar
await window.wavoip.call.start("5511999999999", { fromTokens: ["token-a"] });
```

### `getCallActive()`

Retorna a chamada ativa atual ou `undefined`.

```ts
const active = window.wavoip.call.getCallActive();
if (active) {
  console.log(active.id, active.status, active.peer);
}
```

### `getCallOutgoing()`

Retorna a chamada que está discando (status anterior ao "ativa") ou `undefined`.

### `getOffers()`

Retorna a lista de ofertas (chamadas recebidas pendentes de atender).

### `setInput(number)`

Define o conteúdo atual do discador. O valor é persistido no store da middleware, então funciona mesmo se a tela de discagem ainda não foi montada.

```ts
window.wavoip.call.setInput("5511999999999");
```

### `onOffer(cb)`

Registra um callback disparado a cada nova oferta recebida. Atalho equivalente a `api.use("offer", (offer, next) => { cb(offer); next(); })`. Para padrões mais avançados (bloquear/modificar a oferta antes de chegar na UI), use [`use`](#use).

```ts
window.wavoip.call.onOffer((offer) => {
  console.log("Recebendo chamada de:", offer.peer);
});
```

## `device`

Gerencia os dispositivos Wavoip cadastrados no navegador.

| Método | Descrição |
| --- | --- |
| `get()` | Retorna o array de dispositivos cadastrados. |
| `add(token, persist)` | Cadastra um dispositivo pelo token. Quando `persist` é `true`, grava em `localStorage`. |
| `remove(token)` | Remove o dispositivo. |
| `enable(token)` | Habilita o dispositivo para originar/receber chamadas. |
| `disable(token)` | Desabilita o dispositivo. |

```ts
window.wavoip.device.add("token-abc", true);
window.wavoip.device.enable("token-abc");

const devices = window.wavoip.device.get();
```

{% hint style="warning" %}
**Métodos depreciados.** As versões verbosas abaixo ainda funcionam, mas emitem `console.warn` e serão removidas em uma versão major futura. Prefira os aliases curtos.

| Depreciado | Use no lugar |
| --- | --- |
| `getDevices()` | `get()` |
| `addDevice(token, persist)` | `add(token, persist)` |
| `removeDevice(token)` | `remove(token)` |
| `enableDevice(token)` | `enable(token)` |
| `disableDevice(token)` | `disable(token)` |
{% endhint %}

## `notifications`

Fila de notificações exibidas na barra superior.

| Método | Descrição |
| --- | --- |
| `get()` | Lista as notificações atuais. |
| `add(n)` | Adiciona uma notificação. |
| `remove(id)` | Remove pelo `id` (`Date`). |
| `clear()` | Esvazia a lista. |
| `read()` | Marca todas como lidas. |

{% hint style="warning" %}
**Métodos depreciados.** As versões verbosas abaixo ainda funcionam, mas emitem `console.warn` e serão removidas em uma versão major futura. Prefira os aliases curtos.

| Depreciado | Use no lugar |
| --- | --- |
| `getNotifications()` | `get()` |
| `addNotification(n)` | `add(n)` |
| `removeNotification(id)` | `remove(id)` |
| `clearNotifications()` | `clear()` |
| `readNotifications()` | `read()` |
{% endhint %}

## `widget`

Controla o painel e o botão flutuante.

```ts
window.wavoip.widget.open();
window.wavoip.widget.close();
window.wavoip.widget.toggle();

window.wavoip.widget.buttonPosition.set("bottom-right");
window.wavoip.widget.buttonPosition.set({ x: 24, y: 24 });
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `isOpen` | `boolean` | Estado atual do painel. |
| `open()` | `() => void` | Abre o painel. |
| `close()` | `() => void` | Fecha o painel. |
| `toggle()` | `() => void` | Alterna o painel. |
| `buttonPosition.value` | `{ x, y }` | Posição atual do botão. |
| `buttonPosition.set(pos)` | `(WidgetButtonPosition) => void` | Define a posição do botão (preset ou coordenada). |

## `theme`

```ts
window.wavoip.theme.set("dark");
window.wavoip.theme.set("light");
window.wavoip.theme.set("system");
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` | `"dark" \| "light" \| "system"` | Tema atual. |
| `set(theme)` | `(Theme) => void` | Troca o tema. |

{% hint style="warning" %}
**`setTheme(theme)` está depreciado.** Ainda funciona, mas emite `console.warn` e será removido em uma versão major futura. Use `set(theme)` no lugar.
{% endhint %}

## `position`

Posição do painel do webphone (independente do botão flutuante).

```ts
window.wavoip.position.set("center");
window.wavoip.position.set({ x: 200, y: 100 });
```

Aceita os mesmos presets descritos em [`WebphonePosition`](../primeiros-passos/inicializacao.md#opcoes-de-webphonesettings).

## `on`

Assinatura de eventos do ciclo de vida do webphone. Diferente de [`use`](#use), os handlers de `on` são fire-and-forget — não podem bloquear ou modificar payloads.

```ts
const unsubscribe = window.wavoip.on("call:started", (call) => {
  console.log("Chamada iniciada:", call.id, "para", call.peer.phone);
});

// Para desinscrever
unsubscribe();
```

### Eventos disponíveis

| Evento | Payload | Quando dispara |
| --- | --- | --- |
| `call:started` | `CallOutgoingProps` | Logo após `call.start()` — quando a chamada de saída aparece no store. |
| `call:accepted` | `CallActiveProps` | Peer aceitou a chamada; a outgoing virou active. |
| `call:ended` | `{ id: string; status: CallStatus }` | Status entrou em estado terminal (`ENDED`, `FAILED`, `REJECTED`, `NOT_ANSWERED`). |
| `offer:received` | `CallOfferProps` | Uma oferta entrou no store após passar pela cadeia de middleware. |

```ts
window.wavoip.on("call:ended", ({ id, status }) => {
  if (status === "FAILED") notifyOps(`Falha na chamada ${id}`);
});

window.wavoip.on("offer:received", (offer) => {
  metrics.increment("calls.incoming");
});
```

## `use`

Registra middleware estilo Express para interceptar eventos antes que cheguem à UI. Atualmente só o evento `offer` é suportado.

```ts
window.wavoip.use("offer", (offer, next) => {
  // Modificar o display name antes da UI renderizar
  offer.peer.displayName = lookupContact(offer.peer.phone);
  next();
});

window.wavoip.use("offer", async (offer, next) => {
  // Bloquear ofertas de números banidos — não chama next()
  if (await isBanned(offer.peer.phone)) {
    return offer.reject();
  }
  next();
});
```

| Argumento | Tipo | Descrição |
| --- | --- | --- |
| `event` | `"offer"` | Evento alvo. Outros serão adicionados em versões futuras. |
| `fn` | `(payload, next) => void \| Promise<void>` | Handler. Chame `next()` para passar adiante; omita para bloquear. |

{% hint style="info" %}
Mutações no `payload` afetam o objeto que a UI recebe. Use middleware para enriquecer metadados (display name, profile picture) ou aplicar políticas de filtro centralmente.
{% endhint %}

## `settings`

Atalhos para esconder ou exibir áreas da UI sem precisar remontar o webphone.

| Propriedade | Setter |
| --- | --- |
| `showNotifications` | `setShowNotifications(boolean)` |
| `showSettings` | `setShowSettings(boolean)` |
| `showDevices` | `setShowDevices(boolean)` |
| `showAddDevices` | `setShowAddDevices(boolean)` |
| `showEnableDevices` | `setShowEnableDevices(boolean)` |
| `showRemoveDevices` | `setShowRemoveDevices(boolean)` |
| `showWidgetButton` | `setShowWidgetButton(boolean)` |

```ts
window.wavoip.settings.setShowWidgetButton(false);
window.wavoip.settings.setShowDevices(true);
```

## Aguardando a API ficar pronta

`window.wavoip` só é definido depois que `webphone.render()` resolve. Antes disso o objeto não existe e qualquer acesso direto lança `TypeError`. Use a promise retornada por `render()` ou aguarde a `webphoneAPIPromise()` exportada:

```ts
import webphone from "@wavoip/wavoip-webphone";
import { webphoneAPIPromise } from "@wavoip/wavoip-webphone/api";

webphone.render(); // não awaitamos aqui

const api = await webphoneAPIPromise();
// equivalente ao retorno de render()
```

A `webphoneAPIPromise()` resolve assim que o `MiddlewareRoot` monta — o que acontece no primeiro `render()` da árvore React. A partir desse ponto, `window.wavoip` aponta para a mesma instância.
