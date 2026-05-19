---
description: Biblioteca de webphone customizável da Wavoip para realização de chamadas via WhatsApp.
icon: phone
---

# Wavoip Webphone

O **Wavoip Webphone** é uma biblioteca React empacotada como Web Component que disponibiliza uma interface de chamadas pronta para uso. Ele encapsula todo o ciclo de uma chamada — discagem, chamada ativa, recebimento de ofertas, notificações — em um único elemento renderizado em um Shadow DOM isolado do projeto onde está instalado.

A biblioteca usa o [Wavoip API](https://github.com/wavoip/wavoip-api) internamente para comunicação com os dispositivos.

{% hint style="info" %}
O webphone é renderizado dentro de um Shadow DOM, portanto não sofre interferência dos estilos da página hospedeira nem interfere nela.
{% endhint %}

## O que você encontra nesta documentação

<table data-view="cards">
  <thead>
    <tr>
      <th>Título</th>
      <th data-card-target data-type="content-ref">Alvo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Inicializando o Webphone</td>
      <td><a href="primeiros-passos/inicializacao.md">Bootstrap</a></td>
    </tr>
    <tr>
      <td>API pública (<code>window.wavoip</code>)</td>
      <td><a href="referencia/api-publica.md">Referência</a></td>
    </tr>
    <tr>
      <td>Customizando as cores</td>
      <td><a href="customizacao/cores.md">Cores e tema</a></td>
    </tr>
  </tbody>
</table>
