

# Picture-in-Picture

Durante uma chamada, o usuário pode destacar o Webphone em uma janela flutuante utilizando a Document Picture-in-Picture API. A janela sobrepõe as demais aplicações do sistema operacional, permitindo a visualização e o controle da ligação enquanto o foco principal do usuário está em outra aba ou aplicativo.

## Ciclo de vida da janela

O gerenciamento da janela flutuante segue regras estritas de abertura e fechamento para garantir a sincronia de estado com a aba original.

| Evento | Comportamento |
| --- | --- |
| Abertura | Acionada exclusivamente via clique no botão de PiP no componente `StatusBar`. Não há abertura automática ao discar ou ao aceitar uma chamada recebida. |
| Fechamento pelo usuário | Ocorre quando a janela flutuante é encerrada via controles nativos do SO. A interface principal reassume o estado do sistema. |
| Fechamento automático | Ocorre na transição de estado da chamada para inativa, caso o PiP já estivesse aberto. |

## Permissão de microfone

O prompt de permissão de hardware nativo do navegador é sempre instanciado na **aba de origem**, nunca na janela flutuante gerada pelo Picture-in-Picture.


Caso a permissão de microfone ainda não tenha sido concedida na origem da aplicação, a interface de chamada permanecerá travada no estado de `Conectando...`. O usuário necessita retornar à aba principal para interagir com o prompt do sistema. Recomenda-se instruir os usuários a persistirem essa permissão no navegador para evitar o bloqueio em chamadas subsequentes.

## Limitações conhecidas

- **Suporte de navegador não universal**: Em navegadores que não suportam a Document Picture-in-Picture API, o botão de PiP não produz efeito. O suporte atual compreende Chrome, Edge, Opera e Firefox. Consulte a [tabela de compatibilidade atualizada no MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API#browser_compatibility) para detalhes por versão de software.
- **Ausência de limite dimensional**: A janela PiP instanciada pode ser redimensionada livremente pelo usuário final via controles do sistema operacional. Não há suporte na API para forçar restrições de tamanho mínimo (`min-width` ou `min-height`), o que pode causar quebra de layout caso o usuário a reduza excessivamente.