---
description: Personalize as cores do webphone usando propriedades customizadas do CSS.
icon: palette
---

# Temas

O webphone renderiza dentro de um Shadow DOM e usa propriedades customizadas do CSS (variáveis) para todas as cores. Você pode sobrescrever essas variáveis para combinar com a sua marca.

{% hint style="info" %}
Como o widget vive em um Shadow DOM, seletores CSS padrão da sua página não conseguem acessar seus internos. Sobrescreva as variáveis no elemento `:host` via uma tag `<style>` injetada no shadow root — ou modifique `src/assets/index.css` se você está construindo a partir do código-fonte.
{% endhint %}

## Variáveis CSS disponíveis

O widget vem com paletas clara e escura. Sobrescreva qualquer variável no escopo `:host` ou `.dark`.

### Tema claro (padrão)

```css
:host {
  --background:            oklch(1 0 0);             /* Fundo do painel principal */
  --foreground:            oklch(0.141 0.005 285.823); /* Texto principal */
  --card:                  oklch(1 0 0);             /* Fundo de card/superfície */
  --card-foreground:       oklch(0.141 0.005 285.823);
  --widget-background:     oklch(72.3% 0.219 149.579); /* Fundo do botão flutuante */
  --widget-background-hover: oklch(62.7% 0.194 149.214);
  --widget-text:           oklch(1 0 0);             /* Cor do ícone do botão flutuante */
  --primary:               oklch(0.723 0.219 149.579); /* Cor de destaque / ação */
  --primary-foreground:    oklch(0.982 0.018 155.826);
  --secondary:             oklch(0.967 0.001 286.375);
  --secondary-foreground:  oklch(0.21 0.006 285.885);
  --muted:                 oklch(0.962 0.004 286.32);
  --muted-foreground:      oklch(0.552 0.016 285.938);
  --accent:                oklch(0.8865 0.0054 286.29);
  --accent-foreground:     oklch(0.21 0.006 285.885);
  --destructive:           oklch(0.577 0.245 27.325); /* Vermelho de erro / encerrar chamada */
  --border:                oklch(0.92 0.004 286.32);
  --input:                 oklch(0.92 0.004 286.32);
  --ring:                  oklch(0.723 0.219 149.579); /* Anel de foco */
  --radius:                0.65rem;                  /* Raio da borda */
}
```

### Tema escuro

```css
:host .dark {
  --background:            oklch(0.2493 0.0114 278.04);
  --foreground:            oklch(0.985 0 0);
  --card:                  oklch(0.21 0.006 285.885);
  --card-foreground:       oklch(0.985 0 0);
  --primary:               oklch(0.696 0.17 162.48);
  --primary-foreground:    oklch(0.393 0.095 152.535);
  --secondary:             oklch(0.274 0.006 286.033);
  --secondary-foreground:  oklch(0.985 0 0);
  --muted:                 oklch(0.2901 0.0092 276.8);
  --muted-foreground:      oklch(0.705 0.015 286.067);
  --accent:                oklch(32.617% 0.00528 286.007);
  --accent-foreground:     oklch(0.985 0 0);
  --destructive:           oklch(0.704 0.191 22.216);
  --border:                oklch(1 0 0 / 10%);
  --input:                 oklch(1 0 0 / 15%);
  --ring:                  oklch(0.527 0.154 150.069);
}
```

## Variáveis principais

| Variável | O que controla |
|---|---|
| `--background` | Fundo do painel principal |
| `--foreground` | Cor do texto principal |
| `--primary` | Botões de ação, destaques, anel do discador |
| `--destructive` | Botão de encerrar chamada, estados de erro |
| `--widget-background` | Fundo do botão flutuante de alternância |
| `--widget-text` | Ícone do botão flutuante de alternância |
| `--border` | Divisórias e contornos |
| `--radius` | Border-radius de todos os elementos arredondados |

## Abordagens de personalização

{% columns %}
{% column %}
### Build a partir do código-fonte

Edite `src/assets/index.css` diretamente e reconstrua:

```css
:host {
  --primary: oklch(0.6 0.2 260);  /* Azul */
  --widget-background: oklch(0.6 0.2 260);
}
```

Depois execute `pnpm build`.
{% endcolumn %}

{% column %}
### Injeção em tempo de execução

Injete um elemento `<style>` no shadow root após o render. Isso requer a referência ao shadow root, que atualmente não é exposta pela API pública — use a abordagem de build a partir do código-fonte para mudanças permanentes.
{% endcolumn %}
{% endcolumns %}

## Alternância de tema

Alterne entre temas em tempo de execução via API:

```typescript
api.theme.set("dark")    // Forçar escuro
api.theme.set("light")   // Forçar claro
api.theme.set("system")  // Seguir preferência do SO
```

Ou configure o tema inicial no render:

```typescript
await webphone.render({ theme: "dark" })
```
