---
description: Como alterar a paleta de cores do Webphone editando as variáveis CSS.
icon: palette
---

# Cores e tema

A paleta do webphone é definida por variáveis CSS no formato [oklch](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch) seguindo a convenção do [shadcn/ui](https://ui.shadcn.com/docs/theming). Cada variável tem um par claro (definido em `:host, :root`) e escuro (definido em `.dark`).

{% hint style="warning" %}
A customização de cores **só é possível clonando o repositório** [`wavoip/webphone`](https://github.com/wavoip/webphone) e editando o arquivo [`src/assets/index.css`](https://github.com/wavoip/webphone/blob/main/src/assets/index.css). As variáveis são compiladas e empacotadas dentro do bundle do Web Component, então o pacote npm publicado não as expõe para sobrescrita em runtime.
{% endhint %}

## Fluxo de customização

{% stepper %}
{% step %}
### Clone o repositório

```bash
git clone https://github.com/wavoip/webphone.git
cd webphone
pnpm install
```
{% endstep %}

{% step %}
### Edite `src/assets/index.css`

Localize o bloco `:host, :root` (tema claro) e o bloco aninhado `.dark` (tema escuro) e altere os valores das variáveis listadas abaixo.

```css
:host, :root {
  --primary: oklch(0.723 0.219 149.579);
  /* ... */

  .dark {
    --primary: oklch(0.696 0.17 162.48);
    /* ... */
  }
}
```
{% endstep %}

{% step %}
### Gere o build

```bash
pnpm build
```

O bundle gerado em `dist/` já carrega a nova paleta.
{% endstep %}

{% step %}
### Use o build customizado

Publique o pacote em um registro privado, instale via caminho local (`pnpm add ./caminho/para/webphone`) ou sirva o `dist/index.es.js` por CDN interno.
{% endstep %}
{% endstepper %}

## Referência das variáveis

As variáveis seguem a convenção do shadcn — sempre em pares `--<token>` (cor de fundo) e `--<token>-foreground` (cor do conteúdo sobre aquele fundo). A documentação oficial está em [ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming).

### Superfícies principais

| Variável | O que muda |
| --- | --- |
| `--background` | Cor de fundo do painel principal do webphone. |
| `--foreground` | Cor do texto sobre `--background`. |
| `--card` | Fundo de cartões internos (lista de chamadas, formulários, blocos agrupados). |
| `--card-foreground` | Texto sobre `--card`. |
| `--popover` | Fundo dos menus e popovers (menu de configurações, menus de seleção). |
| `--popover-foreground` | Texto sobre `--popover`. |

### Botão flutuante (widget)

Variáveis exclusivas do webphone, sem equivalente no shadcn padrão.

| Variável | O que muda |
| --- | --- |
| `--widget-background` | Cor de fundo do botão flutuante do widget. |
| `--widget-background-hover` | Cor de fundo do botão em estado `hover`. |
| `--widget-text` | Cor do ícone/texto do botão flutuante. |

### Cores semânticas

| Variável | O que muda |
| --- | --- |
| `--primary` | Cor de ação principal: botão de chamar, indicadores de chamada ativa, foco. |
| `--primary-foreground` | Texto sobre `--primary` (ex.: rótulo do botão de chamar). |
| `--secondary` | Cor de ação secundária: botões alternativos, abas inativas. |
| `--secondary-foreground` | Texto sobre `--secondary`. |
| `--muted` | Tons de baixa ênfase: divisores, placeholders, fundos de seções calmas. |
| `--muted-foreground` | Texto secundário, legendas, labels descritivos. |
| `--accent` | Realce sutil em estados de hover/focus de itens de lista e menus. |
| `--accent-foreground` | Texto sobre `--accent`. |
| `--destructive` | Ações destrutivas: encerrar chamada, remover dispositivo, recusar oferta. |

### Bordas, inputs e foco

| Variável | O que muda |
| --- | --- |
| `--border` | Cor da borda padrão de cartões, separadores e blocos. |
| `--input` | Cor da borda de campos de formulário (discador, inputs de configuração). |
| `--ring` | Cor do anel de foco quando o usuário navega via teclado. |
| `--radius` | Raio base dos cantos arredondados. Os tokens `--radius-sm`, `--radius-md`, `--radius-lg` e `--radius-xl` derivam dele. |

### Gráficos

Reservadas para visualizações de dados. Atualmente o webphone não exibe gráficos por padrão, mas mantemos os tokens para extensões futuras e paridade com o shadcn.

| Variável | O que muda |
| --- | --- |
| `--chart-1` | Primeira série em gráficos. |
| `--chart-2` | Segunda série. |
| `--chart-3` | Terceira série. |
| `--chart-4` | Quarta série. |
| `--chart-5` | Quinta série. |

### Sidebar

Tokens dedicados à barra lateral para que ela possa ter contraste próprio sem afetar o painel principal.

| Variável | O que muda |
| --- | --- |
| `--sidebar` | Fundo da sidebar. |
| `--sidebar-foreground` | Texto sobre `--sidebar`. |
| `--sidebar-primary` | Cor primária dentro da sidebar (item ativo). |
| `--sidebar-primary-foreground` | Texto sobre `--sidebar-primary`. |
| `--sidebar-accent` | Realce de hover na sidebar. |
| `--sidebar-accent-foreground` | Texto sobre `--sidebar-accent`. |
| `--sidebar-border` | Borda interna da sidebar. |
| `--sidebar-ring` | Anel de foco dentro da sidebar. |

## Exemplo: trocando a cor primária para roxo

```css
:host, :root {
  --primary: oklch(0.62 0.22 295);
  --primary-foreground: oklch(0.99 0 0);
  --ring: oklch(0.62 0.22 295);
  --widget-background: oklch(0.62 0.22 295);
  --widget-background-hover: oklch(0.55 0.21 295);

  .dark {
    --primary: oklch(0.7 0.19 295);
    --primary-foreground: oklch(0.2 0.05 295);
    --ring: oklch(0.55 0.18 295);
    --widget-background: oklch(0.62 0.22 295);
    --widget-background-hover: oklch(0.55 0.21 295);
  }
}
```

{% hint style="info" %}
Para manter contraste adequado, atualize `--ring` e as variáveis `--widget-*` junto com `--primary`. Use uma ferramenta como [oklch.com](https://oklch.com/) para visualizar e ajustar os valores.
{% endhint %}

## Recomendações

* **Mantenha o par `--token` / `--token-foreground` em sintonia.** Se você escurece o fundo, clareie o foreground correspondente para preservar legibilidade.
* **Ajuste tema claro e escuro juntos.** As duas declarações vivem no mesmo arquivo; alterar só uma cria inconsistências para usuários que trocam de tema.
* **Não remova variáveis.** Componentes shadcn assumem que todos os tokens estão presentes. Para "neutralizar" uma cor, ajuste o valor em vez de apagar a declaração.
