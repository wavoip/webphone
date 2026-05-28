---
description: Como instalar o Wavoip Webphone via gerenciador de pacotes ou CDN.
icon: download
---

# Instalação

O Wavoip Webphone é distribuído como o pacote npm [`@wavoip/wavoip-webphone`](https://www.npmjs.com/package/@wavoip/wavoip-webphone). Escolha entre instalar via gerenciador de pacotes (projetos com bundler) ou via CDN (HTML estático, prototipagem rápida).

## Gerenciador de pacotes

{% tabs %}
{% tab title="npm" %}
```bash
npm install @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add @wavoip/wavoip-webphone
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @wavoip/wavoip-webphone
```
{% endtab %}
{% endtabs %}

Depois de instalar, importe o módulo padrão:

```ts
import webphone from "@wavoip/wavoip-webphone";

await webphone.render();
```

{% hint style="info" %}
Pacote já vem com tipos TypeScript (`dist/index.d.ts`). Sem necessidade de instalar `@types/*` separado.
{% endhint %}

## CDN (jsDelivr)

Para HTML estático ou prototipagem rápida, carregue o bundle ESM direto via jsDelivr. Página do pacote: [jsdelivr.com/package/npm/@wavoip/wavoip-webphone](https://www.jsdelivr.com/package/npm/@wavoip/wavoip-webphone@latest).

```html
<!doctype html>
<html>
  <body>
    <script type="module">
      import webphone from "https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.es.js";

      await webphone.render();
    </script>
  </body>
</html>
```

### Fixar versão

`@latest` resolve sempre para a versão mais recente publicada. Em produção, fixe uma versão específica para evitar quebras inesperadas:

```html
<script type="module">
  import webphone from "https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@1.3.9/dist/index.es.js";
  await webphone.render();
</script>
```

{% hint style="warning" %}
Fixar a versão na URL **não basta** para builds UMD. O webphone verifica o jsDelivr a cada `render()` e troca para a `latest` publicada mesmo com a URL apontando para versão exata. Para travar, adicione `data-auto-update="false"` na tag `<script>` (exemplo abaixo). Imports ESM via `<script type="module">` não disparam o check.

Veja [Auto-atualização da CDN](../recursos/auto-atualizacao.md) para detalhes.
{% endhint %}

```html
<script
  src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@1.3.9/dist/index.umd.min.js"
  data-auto-update="false"
></script>
```

### Build UMD (sem `type="module"`)

Para ambientes que não suportam ESM, use o bundle UMD. Ele expõe o webphone em `window.wavoipWebphone`:

```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
<script>
  wavoipWebphone.render();
</script>
```

### Auto-atualização

Quando carregado via `<script>` na CDN, o webphone verifica o jsDelivr a cada `render()` e troca automaticamente para a versão `latest` publicada. Para desativar o comportamento e travar na versão exata, adicione `data-auto-update="false"` à tag `<script>`. Detalhes completos em [Auto-atualização da CDN](../recursos/auto-atualizacao.md).

```html
<script
  src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@1.4.3/dist/index.umd.min.js"
  data-auto-update="false"
></script>
```

## Próximo passo

Com o pacote instalado, prossiga para [Inicializando o Webphone](inicializacao.md) para entender `render()`, `destroy()` e as opções de configuração.
