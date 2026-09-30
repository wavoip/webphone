import type { ActiveCall, OutgoingCall } from "@wavoip/wavoip-api/web";
import { createSignal, Show } from "solid-js";
import { toast } from "solid-sonner";
import {
  DotsNine,
  Microphone,
  MicrophoneSlash,
  Pause,
  PhoneOutgoing,
  PhoneSlash,
  VideoCameraSlash,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/solid/context";

type Props = {
  call?: ActiveCall | OutgoingCall;
};

export function CallButtons(props: Props) {
  const middleware = useMiddleware();
  const [actionMade, setActionMade] = createSignal(false);
  const [muted, setMuted] = createSignal(false);

  // Numa chamada ainda não atendida o botão vermelho cancela, e o cancelamento pode ser
  // recusado (ver CallController.cancel) — por isso o botão volta, e não trava.
  const isOutgoing = () => props.call?.direction === "OUTGOING" && props.call.status !== "ACTIVE";

  const hangUpLabel = () =>
    actionMade() && isOutgoing() ? t("Canceling...") : isOutgoing() ? t("Cancel call") : t("End");

  const hangUp = async () => {
    setActionMade(true);
    const { error } = isOutgoing()
      ? await middleware.controllers.call.cancel()
      : await middleware.controllers.call.end();
    if (!error) return;
    setActionMade(false);
    toast.error(isOutgoing() ? t("Could not cancel the call") : t("Could not end the call"));
  };

  return (
    <div class="wv:grid wv:grid-cols-3 wv:grid-rows-2 wv:w-full wv:gap-3 wv:mb-15">
      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p class="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <Pause size={32} weight="fill" />
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">{t("Hold")}</p>
      </div>

      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:size-[55px]"
          disabled
        >
          <p class="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <VideoCameraSlash size={32} weight="fill" />
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">
          {t("Video")}
        </p>
      </div>

      {/* Um botão só: o que muda entre mudo e falando é o ícone, a cor e qual comando
          chamar — e ter dois blocos quase iguais fazia qualquer ajuste precisar de dois. */}
      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          onClick={() => {
            const alvo = muted();
            const comando = alvo ? props.call?.unmute() : props.call?.mute();
            comando?.then(() => setMuted(!alvo));
          }}
          disabled={actionMade()}
        >
          <p class={`wv:text-[24px] wv:leading-6 wv:font-semibold ${muted() ? "wv:text-[red]" : ""}`}>
            <Show when={muted()} fallback={<Microphone size={32} weight="fill" />}>
              <MicrophoneSlash size={32} weight="fill" />
            </Show>
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
          {muted() ? t("Unmute") : t("Mute")}
        </p>
      </div>

      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p class="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneOutgoing size={32} weight="fill" />{" "}
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">
          {t("Transfer")}
        </p>
      </div>
      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:size-[55px] wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:bg-[#e7000b]"
          onClick={hangUp}
          disabled={actionMade()}
          title={hangUpLabel()}
          aria-label={hangUpLabel()}
          aria-busy={actionMade() && isOutgoing()}
        >
          <p class="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneSlash size={32} weight="fill" />
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
          {hangUpLabel()}
        </p>
      </div>
      <div class="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p class="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <DotsNine size={32} />
          </p>
        </Button>
        <p class="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">
          {t("Keypad")}
        </p>
      </div>
    </div>
  );
}
