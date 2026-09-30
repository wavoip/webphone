import { createSignal, onCleanup, Show } from "solid-js";
import { toast } from "solid-sonner";
import { ContactAvatar } from "@/components/ContactAvatar";
import { Phone, PhoneSlash, WhatsappLogo, X } from "@/components/icons";
import MarqueeText from "@/components/MarqueeText";
import { Button } from "@/components/ui/button";
import { type TranslationKey, t } from "@/lib/i18n";
import type { IgnorableOffer } from "@/middleware/store/slices/callSlice";

type Props = {
  offer: IgnorableOffer;
};

/** Cada desfecho tem um evento próprio na v3, e cada um encerra a oferta na tela. */
const DESFECHOS: {
  evento: "ended" | "acceptedElsewhere" | "rejectedElsewhere" | "cancelled";
  texto: TranslationKey;
}[] = [
  { evento: "ended", texto: "Call ended" },
  { evento: "acceptedElsewhere", texto: "Accepted by another user" },
  { evento: "rejectedElsewhere", texto: "Rejected by the app" },
  { evento: "cancelled", texto: "Canceled by the caller" },
];

export function OfferNotification(props: Props) {
  const [showActions, setShowActions] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [status, setStatus] = createSignal<string | null>(null);

  for (const { evento, texto } of DESFECHOS) {
    onCleanup(
      props.offer.on(evento, () => {
        setStatus(t(texto));
        setShowActions(false);
      }),
    );
  }

  /** Recusa e aceite falham do mesmo jeito: o botão volta e o código aparece. */
  const resolver = (comando: Promise<{ error: { code: string } | null }>) => {
    setShowActions(false);
    comando.then(({ error: erro }) => {
      if (erro) {
        setError(erro.code);
        setShowActions(true);
        return;
      }
      toast.dismiss(props.offer.id);
    });
  };

  return (
    <div class="wv:flex wv:flex-col wv:gap-3 wv:w-[365px] wv:bg-background">
      <div class="wv:flex wv:flex-row wv:gap-1">
        <div class="wv:flex wv:flex-row wv:justify-between wv:gap-2 ">
          <div class="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-75 wv:text-foreground">
            <WhatsappLogo size={20} color="currentColor" />

            <p class="wv:text-foreground wv:text-[14px] wv:select-none">Whatsapp Audio</p>
          </div>

          <div class="wv:flex wv:items-center wv:space-x-1">
            <span class="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce1"></span>
            <span class="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce2"></span>
            <span class="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce3"></span>
          </div>
        </div>
      </div>
      <div class="wv:flex wv:gap-3">
        <ContactAvatar
          class="wv:size-[50px] wv:rounded-xl"
          src={props.offer.peer?.profilePicture}
          displayName={props.offer.peer?.displayName}
        />

        <div class="wv:flex-grow wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
          <Show
            when={error() ?? status()}
            fallback={
              <p class="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{props.offer.peer?.phone}</p>
            }
          >
            <Show when={error()}>
              {(codigo) => <p class="wv:text-xm wv:text-ellipsis wv:text-red-600">{t(codigo() as TranslationKey)}</p>}
            </Show>
            <Show when={status()}>
              {(texto) => <p class="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{texto()}</p>}
            </Show>
          </Show>
          <div class="wv:hidden  wv:group-hover/title:block">
            <MarqueeText speed={10} class="wv:text-[24px] wv:leading-[28px] wv:font-normal wv:select-none">
              {props.offer.peer?.displayName || props.offer.peer?.phone}
            </MarqueeText>
          </div>

          <p class="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
            {props.offer.peer?.displayName || props.offer.peer?.phone}
          </p>
        </div>
        <Show when={showActions()}>
          <div class="wv:flex wv:flex-row wv:gap-2">
            <Button
              type="submit"
              size={"icon"}
              class="wv:text-[white] wv:p-4 wv:bg-red-500 wv:hover:bg-red-700 wv:active:bg-red-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => resolver(props.offer.reject())}
            >
              <PhoneSlash class="wv:size-5" weight="fill" />
            </Button>
            <Button
              type="submit"
              size={"icon"}
              aria-label={t("Ignore")}
              class="wv:text-muted-foreground wv:p-4 wv:bg-muted wv:hover:bg-accent wv:active:bg-accent/60 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => {
                setShowActions(false);
                props.offer.ignore();
                toast.dismiss(props.offer.id);
              }}
            >
              <X class="wv:size-5" weight="bold" />
            </Button>
            <Button
              type="submit"
              size={"icon"}
              class="wv:text-[white]  wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:active:bg-green-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => resolver(props.offer.accept())}
            >
              <Phone class="wv:size-5" weight="fill" />
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
}
