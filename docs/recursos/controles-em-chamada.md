# Controles em chamada

A tela de chamada apresenta uma grade de seis controles. Nesta versão, apenas **Silenciar** e **Finalizar** estão operacionais; os demais permanecem visíveis e desabilitados, reservados para implementações futuras.

| Controle | Estado | Comportamento |
| --- | --- | --- |
| Espera | Desabilitado | Reservado. |
| Vídeo | Desabilitado | Reservado. |
| Silenciar / Falar | Ativo | Alterna o microfone local. Consulte a seção abaixo. |
| Transferir | Desabilitado | Reservado. |
| Finalizar | Ativo | Encerra a chamada. Após o clique, todos os controles ficam bloqueados até o encerramento se concluir, evitando acionamento duplicado. |
| Teclado | Desabilitado | Reservado. |

A mesma grade é exibida na tela de discagem (durante o toque) e na tela de chamada ativa.

## Silenciamento do microfone

O botão alterna entre dois rótulos: **Silenciar** quando o microfone está aberto e **Falar** quando está silenciado, este último acompanhado de ícone em vermelho.

### Persistência do estado

O silenciamento pode ser acionado a qualquer momento, inclusive **durante o toque**, antes de o contato atender. Nesse caso o estado é preservado:

| Transição | Comportamento |
| --- | --- |
| Contato atende a chamada | O silenciamento é mantido. A tela de chamada já abre indicando **Falar**, respeitando a intenção registrada durante o toque. |
| Abertura da janela Picture-in-Picture | O silenciamento é mantido e o botão reflete o estado corrente. |
| Fechamento da janela Picture-in-Picture | O silenciamento é mantido. |
| Início de uma nova chamada | O microfone é sempre reaberto. Nenhuma chamada herda o silenciamento da anterior. |

O estado do botão só é atualizado após o `@wavoip/wavoip-api` confirmar a operação. Caso o silenciamento falhe, o controle permanece no estado anterior em vez de indicar uma condição que não se concretizou.

### Indicação de silenciamento do contato

O silenciamento do contato é sinalizado de forma independente: quando o interlocutor silencia o próprio microfone, a área central da tela de chamada substitui a animação de onda sonora pelo indicador **Silenciado**. Esse indicador refere-se exclusivamente ao contato e não é afetado pelo botão de microfone local.
