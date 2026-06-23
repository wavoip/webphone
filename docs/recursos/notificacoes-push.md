---
description: Notificações nativas do navegador quando uma chamada chega com a aba fora de foco.
icon: bell
---

# Notificações push

O Webphone exibe uma notificação nativa do navegador quando uma oferta chega e a aba está fora de foco (minimizada, em segundo plano ou outra aba). A notificação é única e atualiza dinamicamente conforme as ofertas entram e saem.

{% hint style="info" %}
Este recurso é **apenas para abas abertas** mas sem foco. Notificações com a aba **fechada** exigem Service Worker + backend de push (Web Push), o que não é fornecido pela biblioteca.
{% endhint %}

## Como funciona

| Condição | Comportamento |
| --- | --- |
| Aba em foco | Nenhuma notificação. O ringtone toca normalmente. |
| Aba fora de foco + 1 oferta | Notificação `Chamada de <nome>` com o telefone no corpo. |
| Aba fora de foco + N ofertas (N > 1) | Notificação única `N chamadas recebidas`. Corpo lista até 2 peers + `e mais X`. |
| Oferta sai do store sem virar chamada ativa | Entrada `MISSED_CALL` adicionada às notificações in-app. |
| Todas as ofertas resolvidas | Notificação é fechada automaticamente. |
| Permissão diferente de `granted` | Nenhuma notificação. |

A notificação usa o `tag` `wavoip-offer`, então o navegador substitui a anterior em vez de empilhar várias.

## Permissão

A biblioteca **não** pede permissão automaticamente. `Notification.requestPermission()` precisa de um gesto do usuário para não ser bloqueado pelo navegador. Use a API pública num handler de clique:

```ts
const permission = await window.wavoip.notifications.requestPermission();
if (permission === "granted") {
  console.log("Notificações ativadas");
}
```

Para consultar o estado atual sem disparar prompt:

```ts
window.wavoip.notifications.permission(); // "default" | "granted" | "denied"
```

### Solicitação automática

Se o seu fluxo já tem um gesto explícito do usuário antes do `render()` (por exemplo, um botão "Ativar atendimento"), passe `autoRequest: true`:

```ts
await webphone.render({
  offerNotification: {
    autoRequest: true,
  },
});
```

{% hint style="warning" %}
Navegadores rejeitam o prompt quando ele não vem de um clique. `autoRequest` só funciona se o `render()` for chamado dentro do handler de um evento de usuário.
{% endhint %}

## Configuração

```ts
await webphone.render({
  offerNotification: {
    enabled: true,
    autoRequest: false,
    icon: "https://cdn.exemplo.com/icone-chamada.png",
  },
});
```

| Campo | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Quando `false`, suprime a notificação OS mesmo com permissão concedida. |
| `autoRequest` | `boolean` | `false` | Quando `true`, pede permissão na montagem. Requer gesto de usuário. |
| `icon` | `string` | — | URL do ícone exibido na notificação. |

## Clique na notificação

Clicar na notificação foca a aba e abre o painel do webphone. A oferta correspondente fica visível na UI. Não há botões "Aceitar/Rejeitar" — isso exigiria Service Worker.

## Chamadas perdidas

Quando uma oferta sai do store sem ter sido aceita (timeout, rejeição, peer cancelou), uma entrada `MISSED_CALL` é adicionada à lista de notificações in-app:

```ts
const missed = window.wavoip.notifications.get().filter((n) => n.type === "MISSED_CALL");
console.log(missed[0]);
// {
//   id: Date,
//   type: "MISSED_CALL",
//   message: "Chamada perdida de <nome>",
//   detail: "<telefone>",
//   token: "<device_token>",
//   isRead: false,
//   ...
// }
```

{% hint style="info" %}
Entradas de chamada perdida são **in-memory only** — não sobrevivem a um reload. Diferente das notificações adicionadas via `window.wavoip.notifications.add(...)`, que são persistidas em `localStorage`.
{% endhint %}

Para marcar como lida ao usuário clicar no item da lista:

```ts
window.wavoip.notifications.read();
```

`read()` marca **todas** as notificações como lidas. Para granularidade por item, leia via `get()` e use o `id` para distinguir.

## Falhas de chamada

Quando uma chamada em andamento entra em estado `FAILED` (rejeitada pelo transporte, ICE falhou, peer indisponível mid-call, etc.), o Webphone:

1. Persiste o motivo recebido do `@wavoip/wavoip-api` em uma entrada `CALL_FAILED` na lista de notificações.
2. Exibe o motivo na tela ativa (`OutgoingScreen` ou `CallScreen`) logo abaixo do nome/telefone do peer.

```ts
const failed = window.wavoip.notifications.get().filter((n) => n.type === "CALL_FAILED");
console.log(failed[0]);
// {
//   id: "<uuid>",
//   type: "CALL_FAILED",
//   message: "Sem áudio do contato",       // motivo já traduzido para o idioma ativo
//   detail: "<device_token> -> <telefone>",
//   token: "<device_token>",
//   isRead: false,
//   ...
// }
```

O texto exibido em tela e no `message` da notificação é o motivo **traduzido**. O código da SDK é usado diretamente como chave de tradução: o Webphone passa o código para `t()` e cada idioma define um texto amigável. Motivos desconhecidos (códigos novos ainda não traduzidos) caem pelo passthrough do `a18n` e aparecem como o código bruto.

### Motivos mapeados

| Código da SDK         | Significado (pt-BR)                                       |
| --------------------- | --------------------------------------------------------- |
| `PEER_TX_TIMEOUT`     | O contato parou de enviar áudio.                          |
| `PEER_RX_TIMEOUT`     | O usuário parou de enviar áudio.                          |
| `AUDIO_TIMEOUT`       | Alias obsoleto de `PEER_RX_TIMEOUT` — mesma mensagem.     |
| `CORRUPTED_KEYS`      | Não foi possível estabelecer a chamada com segurança.     |
| `CONNECTION_TIMEOUT`  | A chamada perdeu contato com o servidor.                  |
| `ACCOUNT_RESTRICTED`  | Conta do WhatsApp restrita.                               |
| `NO_CALL_PERMISSION`  | Conta sem permissão para realizar chamadas.               |
| `INTERNAL_ERROR`      | Algo deu errado no servidor.                              |

Quando a SDK não fornece motivo (caso típico de chamadas que falham antes do peer aceitar), apenas `A ligação falhou` aparece e o campo `message` da notificação fica vazio.

{% hint style="info" %}
Entradas `CALL_FAILED` são persistidas em `localStorage` junto com as notificações adicionadas via API pública, então sobrevivem a reload.
{% endhint %}

## Limitações conhecidas

- **iOS Safari**: a API `Notification` só funciona em PWAs instaladas, mesmo com a aba aberta. Em Safari tradicional no iOS, nada é exibido.
- **Sem botões de ação**: para botões `Aceitar/Rejeitar` é necessário Service Worker.
- **Sem som customizado**: o ringtone interno toca em paralelo, mas a notificação OS usa o som padrão do sistema.
- **Aba totalmente fechada**: nada chega. Requer Web Push + backend.
