## Estilo de código

- Funções: de 4 a 20 linhas. Passou, divida.
- Arquivos: abaixo de 500 linhas. Divida por responsabilidade.
- Uma coisa por função, uma responsabilidade por módulo (SRP).
- Nomes: específicos e únicos. Evite `data`, `handler`, `Manager`.
  Prefira nomes com menos de 5 ocorrências no grep do código.
- Tipos: explícitos. Nada de `any`, `Dict` ou função sem tipo.
- Sem duplicação. Extraia a lógica compartilhada para uma função ou módulo.
- Retorno cedo em vez de `if` aninhado. No máximo 2 níveis de indentação.
- Mensagem de exceção inclui o valor ofensor e a forma esperada.

## Idioma

**Identificador é em inglês; texto que uma pessoa lê é em português.** Classe, função,
variável, arquivo, chave de tradução do `i18n` e título de `it(…)` em inglês; comentário,
`.md` e mensagem de commit em português. Termo de WebRTC (`ICE`, `SDP`, `track`,
`peer connection`) fica como está: o parágrafo vira português, o termo não.

**Exceção, por enquanto: a superfície pública.** A JSDoc dos tipos que chegam ao
`dist/index.d.ts` — `WebphoneAPI`, `WebphoneSettings`, `WebphoneEventMap`,
`NotificationInput`, `CallStatus` — aparece no editor de quem integra, e a língua dela é
decisão de produto (DEV-453), e não convenção interna. Até ela sair, fica como está.

## Comentários e documentação

- **Comentário registra o que o código não diz**: o porquê, a restrição externa, o
  caminho não tomado. O que a função faz, o que o campo guarda e como se chama a função
  o código já diz. Sem `@example` em código interno — o exemplo que não desatualiza é o
  teste.
- **A decisão mora aqui; a investigação mora na issue.** Cite `DEV-NNN` ou o PR e siga.
  O relato do incidente não entra: ele custa leitura toda vez e não ajuda a próxima
  mudança.
- **Cada regra tem um dono só.** Por que o cancelamento só grava status depois do
  servidor mora no `CallController.cancel`; por que o `dialToken` fica no store, no
  `uiSlice`. Os outros lugares no máximo apontam para ele — duas cópias envelhecem em
  duas velocidades.
- **Releia o comentário e o `.md` que a sua mudança tocou.** Não "preserve" nem
  "atualize se mudou o comportamento": releia. Um comentário que deixou de ser verdade
  é defeito entregue, e documentação errada é pior que ausente, porque a ausente
  ninguém segue.
- **Plano não vira `.md` nem comentário.** Fase, etapa e migração são issue; um plano
  executado que fica no texto vira mentira.

### A documentação de quem integra

Mora em `docs/`, publicada no GitBook; a sintaxe está no [guia do GitBook](./gitbook.md).

Toda mudança que altera como o usuário final ou o integrador usa o webphone atualiza o
`docs/` na mesma mudança:

- aba, menu ou diálogo novo ou renomeado;
- configuração, controle, tema ou idioma novo ou alterado;
- API pública nova ou alterada (`window.wavoip.*`, exports do pacote);
- evento, banner, notificação ou tooltip novo ou alterado;
- mudança de forma de qualquer payload que o usuário copia, exporta ou vê (ex.: o JSON
  do relatório de diagnóstico);
- mudança incompatível na inicialização (`render(config)`), na forma da config ou no
  comportamento padrão.

## Testes

- Os testes rodam com um comando só: `pnpm test`.
- Toda função nova ganha teste. Correção de bug ganha teste de regressão.
- I/O externo (API, banco, sistema de arquivos) é trocado por classes fake nomeadas,
  e não por stubs inline.
- Testes F.I.R.S.T: rápidos, independentes, repetíveis, autoverificáveis, oportunos.

## Estrutura

- Prefira módulos pequenos e focados a arquivos-deus.
- Caminhos previsíveis: controller/model/view, src/lib/test etc.

## Formatação

- Use o formatador padrão da linguagem (`biome`). Não discuta estilo além disso.

## Log

- JSON estruturado no log de depuração e observabilidade.
- Texto puro só na saída de CLI voltada ao usuário.
