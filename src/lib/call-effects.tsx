import { createEffect, onCleanup } from "solid-js";
import { toast } from "solid-sonner";
import { OfferNotification } from "@/components/OfferNotification";
import type { Middleware } from "@/middleware/Middleware";
import { useSurface } from "@/providers/SurfaceProvider";
import { useWidget } from "@/providers/WidgetProvider";

/**
 * O que a chamada faz com a interface, e não com o estado. Mora fora do núcleo porque
 * depende de widget e de Picture-in-Picture, e fora de componente porque não desenha
 * nada — é reação, não tela.
 */
export function wireCallToInterface(middleware: Middleware): void {
  showOffersAsToasts(middleware);
  followCallWithWidget(middleware);
  closePipOnKeyboard(middleware);
}

/**
 * Voltar ao teclado fecha o Picture-in-Picture: a janelinha existe para acompanhar uma
 * chamada. A regra é de interface e mora aqui; a superfície só sabe abrir e fechar.
 */
function closePipOnKeyboard(middleware: Middleware): void {
  const { closePip, isPiP } = useSurface();

  onCleanup(
    middleware.store.subscribe(
      (s) => s.screen,
      (tela, anterior) => {
        if (tela === "keyboard" && anterior !== "keyboard" && isPiP()) closePip();
      },
    ),
  );
}

function showOffersAsToasts(middleware: Middleware): void {
  onCleanup(
    middleware.store.subscribe(
      (s) => s.offers,
      (current, previous) => {
        for (const offer of current) {
          if (previous.some((p) => p.id === offer.id)) continue;
          toast(() => <OfferNotification offer={offer} />, {
            id: offer.id,
            duration: 100_000,
            class: "wv:max-w-[400px] wv:!w-full",
            // Arrastar o toast para longe é ignorar a chamada: para o toque, e não só
            // esconde a notificação. Também dispara nos nossos toast.dismiss(), onde o
            // ignore() não faz nada porque a oferta já saiu.
            onDismiss: () => offer.ignore(),
          });
        }
        for (const offer of previous) {
          if (current.some((c) => c.id === offer.id)) continue;
          setTimeout(() => toast.dismiss(offer.id), 2000);
        }
      },
    ),
  );
}

/**
 * O widget abre sozinho quando entra chamada e volta ao que era quando ela acaba — e o
 * mesmo vale ao entrar e sair do Picture-in-Picture, que esconde o widget da página.
 */
function followCallWithWidget(middleware: Middleware): void {
  const { isClosed, setIsClosed, open: openWidget } = useWidget();
  const { isPiP } = useSurface();
  let closedBeforePip: boolean | null = null;
  let closedBeforeCall: boolean | null = null;

  createEffect(() => {
    if (isPiP()) {
      if (closedBeforePip === null) closedBeforePip = isClosed();
      setIsClosed(true);
      return;
    }
    if (closedBeforePip !== null) {
      setIsClosed(closedBeforePip);
      closedBeforePip = null;
    }
  });

  onCleanup(
    middleware.store.subscribe(
      (s) => Boolean(s.active || s.outgoing),
      (inCall) => {
        if (inCall) {
          if (closedBeforeCall === null) closedBeforeCall = isClosed();
          if (!isPiP()) openWidget();
          return;
        }
        if (closedBeforeCall !== null) {
          if (closedBeforeCall) setIsClosed(true);
          closedBeforeCall = null;
        }
      },
    ),
  );
}
