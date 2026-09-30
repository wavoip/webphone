import { DelegatedEvents, delegateEvents } from "solid-js/web";

/**
 * O Solid registra um ouvinte por tipo de evento numa raiz só e descobre o `onClick`
 * subindo a árvore a partir de `event.target`. A raiz padrão é o `document` — e aí um
 * clique dentro de um shadow root chega lá já retargetado para o host, onde não existe
 * nenhum ouvinte nosso: o widget inteiro fica sem responder a clique. Vale igual para a
 * janela do Picture-in-Picture, que tem documento próprio.
 *
 * Por isso toda raiz que renderizamos fora do `document` da página passa por aqui.
 * Registramos a lista inteira do Solid, e não só os eventos que hoje usamos, porque
 * faltar um não quebra nada visível — o botão simplesmente não responde.
 */
export function delegateEventsToRoot(root: ShadowRoot | Document): void {
  delegateEvents([...DelegatedEvents], root as Document);
}
