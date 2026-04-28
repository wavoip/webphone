---
description: Adicione @wavoip/wavoip-webphone ao seu projeto.
icon: download
---

# Instalação

## Requisitos

* Um navegador moderno com suporte a WebRTC (Chrome 80+, Firefox 75+, Safari 14.1+)
* Um ou mais tokens de dispositivo Wavoip obtidos no [painel de controle Wavoip](https://wavoip.com)

## Instalar via gerenciador de pacotes

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
{% endtabs %}

## Instalar via CDN

Sem etapa de build — inclua o bundle UMD diretamente em qualquer página HTML.

```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
```

O widget estará disponível como `window.wavoipWebphone` após o carregamento do script.

```html
<script>
    window.wavoipWebphone.render().then((api) => {
        api.device.add("seu-token-de-dispositivo", false)
    })
</script>
```

{% hint style="info" %}
Em produção, fixe uma versão específica em vez de `@latest` para evitar mudanças inesperadas:
`/npm/@wavoip/wavoip-webphone@1.3.2/dist/index.umd.min.js`
{% endhint %}
