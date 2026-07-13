

# Picture-in-Picture

Durante uma chamada, o usuário pode destacar o Webphone numa janela flutuante (Document Picture-in-Picture) que fica por cima das outras janelas, permitindo acompanhar a ligação enquanto navega em outra aba ou app.

## Como abrir

Um botão no `StatusBar` alterna a PiP (`togglePip`). Abrir também acontece automaticamente ao discar pelo `KeyboardScreen`.

## Quando a PiP fecha

- O usuário fecha a janela PiP pelo SO.
- A tela volta para o teclado (`screen === "keyboard"`) — por exemplo, ao encerrar a chamada.

## Tamanho da janela

A janela abre com `320x450`. A largura do conteúdo interno é fixa para evitar que o layout quebre, mas o navegador não oferece nenhuma API para impedir o usuário de redimensionar a janela do SO para algo menor.

## Limitações conhecidas


**Suporte de navegador ainda não é universal.** A Document Picture-in-Picture API é suportada nos navegadores Chromium (Chrome, Edge, Opera) e, mais recentemente, no Firefox (a partir da versão 151, maio de 2026). Em navegadores sem suporte, o botão de PiP não faz nada — a ausência é detectada e ignorada silenciosamente (aviso no console).

- **Corrida com o popup de permissão de microfone**: como abrir a PiP move o foco para a nova janela, o popup nativo de pedido de permissão de microfone pode ficar coberto por ela caso apareça depois. Isso pode acontecer em qualquer navegador com suporte a PiP, incluindo Firefox 151+. Peça a permissão antes de chamar `openPip()` para evitar a corrida.
- **Sem trava de tamanho mínimo**: `Window.resizeTo()` só funciona em janelas abertas via `window.open()`, não em janelas de Document Picture-in-Picture. Não há hoje uma forma de impedir o usuário de encolher a janela do SO abaixo do tamanho ideal.
