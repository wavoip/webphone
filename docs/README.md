---
description: Widget de webphone pronto para uso em dispositivos Wavoip — renderiza em um Shadow DOM isolado com uma API programática completa.
icon: phone
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# wavoip-webphone

`@wavoip/wavoip-webphone` é um widget de telefone pré-construído e totalmente isolado que roda dentro da sua aplicação web. Uma única chamada de função renderiza um webphone flutuante que gerencia chamadas WhatsApp recebidas e realizadas — sem nenhuma alteração no layout da sua página.

{% hint style="info" %}
Versão **1.3.2** — construído sobre `@wavoip/wavoip-api` v2.x.
{% endhint %}

## Funcionalidades

* Widget flutuante com botão arrastável — posição configurável
* Notificações de chamada recebida com aceitar / rejeitar
* Discador de chamadas com teclado DTMF
* Interface de gerenciamento de dispositivos (adicionar, remover, ativar, desativar)
* Tema escuro / claro / sistema
* Totalmente isolado no Shadow DOM — zero conflitos de estilo com sua aplicação
* API programática `window.wavoip` para automação via scripts externos

## Início rápido

{% tabs %}
{% tab title="ES Module" %}
```typescript
import webphone from "@wavoip/wavoip-webphone"

// Renderiza o widget e obtém a API
const api = await webphone.render({
    theme: "system",
    position: "bottom-right",
})

// Adiciona um dispositivo
api.device.add("seu-token-de-dispositivo", true)

// Remove o widget
webphone.destroy()
```
{% endtab %}

{% tab title="CDN" %}
```html
<script src="https://cdn.jsdelivr.net/npm/@wavoip/wavoip-webphone@latest/dist/index.umd.min.js"></script>
<script>
    window.wavoipWebphone.render({ theme: "system" }).then((api) => {
        api.device.add("seu-token-de-dispositivo", true)
    })
</script>
```
{% endtab %}
{% endtabs %}

## Explore a documentação

<table data-view="cards">
    <thead>
        <tr>
            <th>Seção</th>
            <th data-card-target data-type="content-ref">Link</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Instalar o pacote</td>
            <td><a href="getting-started/installation.md">Instalação</a></td>
        </tr>
        <tr>
            <td>Configurar &amp; montar</td>
            <td><a href="getting-started/initialization.md">Inicialização</a></td>
        </tr>
        <tr>
            <td>Referência da API JavaScript</td>
            <td><a href="api.md">API JavaScript</a></td>
        </tr>
        <tr>
            <td>Personalizar cores</td>
            <td><a href="theming.md">Temas</a></td>
        </tr>
    </tbody>
</table>
