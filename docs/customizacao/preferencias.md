---
description: Aba Preferências do menu de Configurações — tema e idioma da interface.
icon: sliders
---

# Preferências

A aba **Preferências** dentro de **Configurações** reúne as opções que o usuário final pode alternar a qualquer momento: tema visual e idioma da interface.

## Como abrir

1. Clique no ícone de engrenagem no canto superior direito do Webphone.
2. Selecione a aba **Preferências**.

## Tema

Três opções, escolhidas por botões agrupados:

| Opção        | Comportamento                                                                                |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Claro**    | Força o esquema claro.                                                                       |
| **Escuro**   | Força o esquema escuro.                                                                      |
| **Sistema**  | Segue `prefers-color-scheme` do navegador e reage automaticamente quando o usuário troca o tema do sistema. |

A escolha é persistida em `localStorage` na chave `webphone-ui-theme`. A integração com `window.wavoip.theme.set("light" | "dark" | "system")` continua válida — qualquer escrita programática reflete na aba imediatamente.

## Idioma

Os idiomas distribuídos com o Webphone são:

| Código   | Rótulo                |
| -------- | --------------------- |
| `en`     | English               |
| `pt-BR`  | Português (Brasil)    |
| `es`     | Español               |

Trocar o idioma altera todas as strings traduzidas (`t()`) sem fechar o diálogo de Configurações: a troca dispara apenas uma re-renderização da árvore. O Webphone também propaga a alteração para o `@wavoip/wavoip-api` chamando `wavoip.setLanguage(<código>)`, garantindo que mensagens emitidas pela biblioteca (banners, notificações) saiam no idioma escolhido.

{% hint style="info" %}
Tags BCP-47 como `en-US`, `pt`, `es-419` são normalizadas automaticamente para um dos três idiomas suportados. Quando nenhum mapeamento é possível, o Webphone usa `en` como padrão.
{% endhint %}

## Initialização programática

O idioma inicial pode ser passado no `render()`:

```typescript
window.wavoipWebphone.render({
    language: "pt-BR",
    theme: "dark",
})
```

Quando ambos não são informados, o Webphone usa o tema persistido (ou `system`) e o idioma já armazenado pelo `@wavoip/wavoip-api`.
