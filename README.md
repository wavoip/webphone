---
icon: circle-info
metaLinks:
  alternates:
    - https://app.gitbook.com/s/ChVqWq7WmaNAVFRJHIhR/webphone
---

# Introdução

## Introdução

Essa biblioteca foi feita com o intuito de facilitar a realização de ligações por dispositivos da Wavoip. Ela disponibiliza uma interface customizável e isolada do projeto onde está instalada. Esse webphone usa o [Wavoip API](https://app.gitbook.com/o/Pjg7DisYvBC4236LvBOn/s/yP0muqGlwZafxEaUwSvS/ "mention")  por debaixo dos panos

## Instalação

Instale a biblioteca utilizando seu gerenciador de dependências favorito

{% tabs %}
{% tab title="PNPM" %}
```bash
pnpm add @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm install @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="CDN" %}
```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
```
{% endtab %}
{% endtabs %}

## Primeiros Passos

### Biblioteca instalada

Importe o objeto do webphone e chame a função **render()**

{% code lineNumbers="true" %}
```typescript
import WavoipWebphone from "@wavoip/wavoip-webphone"

WavoipWebphone.render()
```
{% endcode %}

Simples assim, a interface será renderizada na tela.

Para remover a interface, basta chamar a função **destroy()**

{% code lineNumbers="true" %}
```typescript
WavoipWebphone.destroy()
```
{% endcode %}

### CDN

Use a variável **wavoipWebphone** que se encontra dentro da variável _window_

{% code lineNumbers="true" %}
```typescript
window.wavoipWebphone.render()
window.wavoipWebphone.destroy()
```
{% endcode %}
