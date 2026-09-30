# Changelog

## 2.0.0 — não lançada

Reescrita do webphone: SolidJS no lugar do React, `wavoip-api` v3, e dois modos de
distribuição — o widget de sempre e um PWA instalável.

### Mudanças incompatíveis

- **`window.wavoip.call.start`** continua devolvendo `{call, err}`, mas `err.message` agora
  é o **código** do erro da lib (`DEVICE_BUSY`, `ACK_TIMEOUT`, …) em vez de texto livre. A
  v3 não devolve texto legível: o código é o contrato, e quem traduz é quem exibe.
- **`device.get()` e `notifications.get()`** passam a devolver **cópia**. Antes entregavam o
  array do próprio estado, que mudava debaixo de quem o guardasse.
- **Aba de STUN** vira **checagem de ambiente**: além do STUN, ela responde se cada tipo de
  chamada funcionaria agora e o que falta quando não. O JSON de "Copiar relatório" muda:
  `stunResults` vira `checkup`, com `checks` e `readiness`.
- **`react` e `react-dom` deixam de ser dependências.** Quem usa o pacote por `<script>` na
  CDN não precisa fazer nada; quem empacota junto pode remover as cópias que mantinha só
  para o webphone.

### Novidades

- **PWA instalável**, em desktop e celular, com service worker. `pnpm build` produz os dois
  artefatos: `dist` (pacote npm do widget) e `dist-app` (o PWA).
- **`window.wavoip.watch(read, onChange)`** — observa **estado**, enquanto `on` observa
  **evento**. Dispara só quando o que `read` devolve muda, então dá para derivar:

  ```js
  wavoip.watch(() => wavoip.call.getOffers().length, (n) => (badge.textContent = n));
  ```

  Antes era preciso remontar o estado a partir dos eventos e manter uma cópia local em dia.

### Correções

- **Picture-in-Picture ficava inerte.** A janela abria e desenhava certo, mas nenhum botão
  respondia, porque os eventos eram escutados no documento da página e não no dela.
- **O alerta de devices quase nunca aparecia.** A condição exigia que houvesse ao mesmo
  tempo um device desconectado, um esperando QR code, um fechado e um hibernando; com um
  problema só — o caso comum — não aparecia nada. Devices em erro nem contavam.
- **Desligar podia piscar "desconectado"** antes de mostrar "encerrada", porque a parada da
  mídia era lida como queda de conexão.
- **Cinco botões só de ícone não tinham nome acessível** — picture-in-picture, fechar,
  números recentes, apagar dígito e ligar. Eram invisíveis para leitor de tela.
- **O token do device aparecia dentro de um ícone** na lista de avisos: o componente de
  rótulo tinha sido importado da biblioteca de ícones por engano.
- **Abrir as configurações reordenava a lista de números** para o resto da interface, e não
  só para aquela tela.
- **"Número não existe" e "nenhum device disponível" pararam de aparecer** em algum
  momento: a tela comparava contra códigos de erro que a biblioteca renomeou, então um
  número errado virava "falha ao ligar" genérica e o webphone ainda tentava todos os
  outros devices antes de desistir.
- **O som de reconexão podia tocar depois da chamada voltar** ou de acabar: a regra estava
  escrita em dois lugares, e a segunda cópia agendava uma repetição que ninguém cancelava.
- **Cinco botões da tela de chamada ficavam em português** em qualquer idioma — espera,
  vídeo, transferir, teclado e silenciar/falar estavam escritos direto na tela. "Video"
  vira "Vídeo" em português, de quebra. "Silenciado", na tela de chamada, também passa a
  ser traduzido.

### Acessibilidade e desempenho

- Lighthouse do PWA: **100 de acessibilidade, 100 de boas práticas**, sem auditoria
  reprovada.
- Nenhum texto abaixo de 12px.
- O carregamento inicial do PWA é **187 KB brotli**, contra 1940 KB do bundle único
  anterior. O reamostrador de áudio (~1,3 MB) só é baixado quando há chamada, e os sons
  viraram arquivos que o service worker cacheia em vez de texto embutido no JavaScript.

> Mudanças internas — arquitetura, ferramentas, o que muda para quem desenvolve o
> webphone — ficam no [CHANGELOG-INTERNAL.md](./CHANGELOG-INTERNAL.md).
