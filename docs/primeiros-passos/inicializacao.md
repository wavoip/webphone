---
description: Como instalar e inicializar o Wavoip Webphone no seu projeto.
icon: rocket
---

# Inicializando o Webphone

O webphone expõe um objeto único com o método `render()`, que monta o componente em um Shadow DOM anexado ao `document.body`. Para instalar o pacote, veja [Instalação](instalacao.md).

## Bootstrap mínimo

A chamada de `render()` sem argumentos já é suficiente para montar o webphone com as opções padrão.

```ts
import webphone from "@wavoip/wavoip-webphone";

const api = await webphone.render();
```

A promise resolve com a instância da [API pública](../referencia/api-publica.md), que também é exposta globalmente em `window.wavoip` após o `render()`.

{% hint style="info" %}
Chamar `render()` mais de uma vez é seguro — chamadas subsequentes retornam a mesma instância em vez de remontar o componente.
{% endhint %}

## Bootstrap com configuração

`render()` aceita um objeto `WebphoneSettings` opcional para customizar a interface no momento da montagem.

```ts
import webphone from "@wavoip/wavoip-webphone";

await webphone.render({
  theme: "system",
  buttonPosition: "bottom-right",
  position: "bottom-right",
  widget: {
    startOpen: false,
    showWidgetButton: true,
  },
  statusBar: {
    showNotificationsIcon: true,
    showSettingsIcon: true,
  },
  settingsMenu: {
    deviceMenu: {
      show: true,
      showAddDevices: true,
      showEnableDevicesButton: true,
      showRemoveDevicesButton: true,
    },
    audioMenu: {
      show: true,
    },
  },
  callSettings: {
    displayName: "Atendimento",
  },
  platform: "meu-app",
});
```

### Opções de `WebphoneSettings`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `theme` | `"dark" \| "light" \| "system"` | Tema inicial. `system` segue a preferência do SO. |
| `position` | `WebphonePosition` | Posição do painel do webphone. Aceita presets (`top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`) ou um objeto `{ x, y }`. |
| `buttonPosition` | `WidgetButtonPosition` | Posição do botão flutuante do widget. Aceita presets de canto ou `{ x, y }`. |
| `widget.startOpen` | `boolean` | Se o painel deve abrir automaticamente ao montar. |
| `widget.showWidgetButton` | `boolean` | Exibe ou oculta o botão flutuante. |
| `statusBar.showNotificationsIcon` | `boolean` | Ícone de notificações na barra superior. |
| `statusBar.showSettingsIcon` | `boolean` | Ícone de configurações na barra superior. |
| `settingsMenu.deviceMenu.show` | `boolean` | Exibe o menu de dispositivos. |
| `settingsMenu.deviceMenu.showAddDevices` | `boolean` | Botão de adicionar dispositivo. |
| `settingsMenu.deviceMenu.showEnableDevicesButton` | `boolean` | Botão de habilitar dispositivo. |
| `settingsMenu.deviceMenu.showRemoveDevicesButton` | `boolean` | Botão de remover dispositivo. |
| `settingsMenu.audioMenu.show` | `boolean` | Exibe a aba "Audio" no menu de configurações (seleção de microfone e alto-falante). Padrão `true`. |
| `callSettings.displayName` | `string` | Nome exibido para o destinatário ao iniciar chamadas. |
| `offerNotification.enabled` | `boolean` | Liga/desliga a notificação OS de oferta. Padrão `true`. Veja [Notificações push](../recursos/notificacoes-push.md). |
| `offerNotification.autoRequest` | `boolean` | Pede permissão de notificação na montagem. Padrão `false`. |
| `offerNotification.icon` | `string` | URL do ícone exibido na notificação OS. |
| `platform` | `string` | Identificador da plataforma hospedeira repassado ao Wavoip API. |

## Reutilizando uma instância do Wavoip

`render()` aceita uma segunda posição opcional: uma instância já construída de `Wavoip` do pacote `@wavoip/wavoip-api`. Use quando seu app já tem o cliente Wavoip — o webphone se acopla a ele em vez de criar outro.

```ts
import webphone from "@wavoip/wavoip-webphone";
import { Wavoip } from "@wavoip/wavoip-api";

const wavoip = new Wavoip({ tokens: ["token-a"], platform: "meu-app" });

await webphone.render(
  { theme: "dark", widget: { startOpen: true } },
  wavoip,
);
```

Quando uma instância é injetada, o webphone **ainda** lê os tokens persistidos em `localStorage` e os adiciona via `wavoip.addDevices(stored)`. `addDevices` deduplica, então tokens já presentes não são duplicados.

## Desmontagem

Para remover o webphone da página e liberar os recursos:

```ts
webphone.destroy();
```

Após o `destroy()`, `window.wavoip` volta a ser `undefined` e é necessário chamar `render()` novamente para reativá-lo.

## Onde os tokens dos dispositivos ficam

Os tokens dos dispositivos persistem em `localStorage` na chave `wavoip:tokens`. Ao chamar `render()`, o webphone carrega os tokens previamente salvos e usa-os para se conectar ao Wavoip API.

### Persistência é opt-in via API

Dispositivos são **efêmeros por padrão**. Apenas chamadas programáticas com `persist: true` gravam em `localStorage`:

```ts
// Persiste no localStorage — sobrevive ao reload
window.wavoip.device.add("token-a", true);

// Não persiste — somem ao recarregar a página
window.wavoip.device.add("token-b", false);
```

A UI nativa de adicionar dispositivo (no menu de configurações) sempre adiciona como efêmero. Para integrar persistência ao seu fluxo, faça a chamada `add(token, true)` no seu próprio código depois que o usuário confirmar.

{% hint style="warning" %}
Por usar `localStorage`, os tokens são escopados ao domínio do navegador. Trocar de domínio ou usar aba anônima começa sem dispositivos cadastrados.
{% endhint %}
