---
description: Como instalar e inicializar o Wavoip Webphone no seu projeto.
icon: rocket
---

# Inicializando o Webphone

O webphone é distribuído como o pacote npm [`@wavoip/wavoip-webphone`](https://www.npmjs.com/package/@wavoip/wavoip-webphone) e expõe um objeto único com o método `render()`, que monta o componente em um Shadow DOM anexado ao `document.body`.

## Instalação

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="npm" %}
```bash
npm install @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="CDN" %}
```html
<script type="module">
  import webphone from "https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone/dist/index.es.js";
  await webphone.render();
</script>
```
{% endtab %}
{% endtabs %}

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
| `callSettings.displayName` | `string` | Nome exibido para o destinatário ao iniciar chamadas. |
| `platform` | `string` | Identificador da plataforma hospedeira repassado ao Wavoip API. |

## Desmontagem

Para remover o webphone da página e liberar os recursos:

```ts
webphone.destroy();
```

Após o `destroy()`, `window.wavoip` volta a ser `undefined` e é necessário chamar `render()` novamente para reativá-lo.

## Onde os tokens dos dispositivos ficam

Os tokens dos dispositivos persistem em `localStorage`. Ao chamar `render()`, o webphone carrega os tokens previamente salvos e usa-os para se conectar ao Wavoip API. Use a [API de dispositivos](../referencia/api-publica.md#device) para adicionar, remover, habilitar ou desabilitar dispositivos em tempo de execução.

{% hint style="warning" %}
Por usar `localStorage`, os tokens são escopados ao domínio do navegador. Trocar de domínio ou usar aba anônima começa sem dispositivos cadastrados.
{% endhint %}
