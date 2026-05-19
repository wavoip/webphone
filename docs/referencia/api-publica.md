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

A API é dividida em sete módulos:

| Módulo | Responsabilidade |
| --- | --- |
| [`call`](#call) | Iniciar chamadas, ler estado de chamada ativa, manipular o discador. |
| [`device`](#device) | Cadastrar, habilitar, desabilitar e remover dispositivos. |
| [`notifications`](#notifications) | Listar, adicionar, remover e marcar notificações como lidas. |
| [`widget`](#widget) | Abrir, fechar e reposicionar o botão flutuante. |
| [`theme`](#theme) | Trocar entre tema claro, escuro e do sistema. |
| [`position`](#position) | Reposicionar o painel do webphone. |
| [`settings`](#settings) | Mostrar/ocultar áreas da UI em tempo de execução. |

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

### `startCall(to, fromTokens)`

Versão posicional de `start`. Equivalente a `start(to, { fromTokens })`.

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

Define o conteúdo atual do discador.

```ts
window.wavoip.call.setInput("5511999999999");
```

### `onOffer(cb)`

Registra um callback disparado a cada nova oferta recebida.

```ts
window.wavoip.call.onOffer((offer) => {
  console.log("Recebendo chamada de:", offer.peer);
});
```

## `device`

Gerencia os dispositivos Wavoip cadastrados no navegador. Cada método possui um alias curto.

| Método | Alias | Descrição |
| --- | --- | --- |
| `getDevices()` | `get()` | Retorna o array de dispositivos cadastrados. |
| `addDevice(token, persist)` | `add(token, persist)` | Cadastra um dispositivo pelo token. Quando `persist` é `true`, grava em `localStorage`. |
| `removeDevice(token)` | `remove(token)` | Remove o dispositivo. |
| `enableDevice(token)` | `enable(token)` | Habilita o dispositivo para originar/receber chamadas. |
| `disableDevice(token)` | `disable(token)` | Desabilita o dispositivo. |

```ts
window.wavoip.device.add("token-abc", true);
window.wavoip.device.enable("token-abc");

const devices = window.wavoip.device.get();
```

## `notifications`

Fila de notificações exibidas na barra superior.

| Método | Alias | Descrição |
| --- | --- | --- |
| `getNotifications()` | `get()` | Lista as notificações atuais. |
| `addNotification(n)` | `add(n)` | Adiciona uma notificação. |
| `removeNotification(id)` | `remove(id)` | Remove pelo `id` (`Date`). |
| `clearNotifications()` | `clear()` | Esvazia a lista. |
| `readNotifications()` | `read()` | Marca todas como lidas. |

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
| `set(theme)` / `setTheme(theme)` | `(Theme) => void` | Troca o tema. |

## `position`

Posição do painel do webphone (independente do botão flutuante).

```ts
window.wavoip.position.set("center");
window.wavoip.position.set({ x: 200, y: 100 });
```

Aceita os mesmos presets descritos em [`WebphonePosition`](../primeiros-passos/inicializacao.md#opcoes-de-webphonesettings).

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

## Pronto antes da API resolver

A API exposta antes do `await webphone.render()` resolver é um *proxy*: chamadas a métodos retornam valores padrão (arrays vazios, promises com `err: "API not ready yet"`) em vez de quebrar. Isso permite que você passe a referência da API por componentes mesmo antes do bootstrap completo, mas operações reais só funcionam após o `render()` resolver.

{% hint style="warning" %}
Evite invocar `call.start` antes do `render()` resolver — a chamada retornará `{ call: null, err: { message: "API not ready yet", devices: [] } }`.
{% endhint %}
