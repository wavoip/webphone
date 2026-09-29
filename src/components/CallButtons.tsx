import type { ActiveCall, OutgoingCall } from "@wavoip/wavoip-api/web";
import { useState } from "react";
import { toast } from "sonner";
import {
  DotsNine,
  Microphone,
  MicrophoneSlash,
  Pause,
  PhoneSlash,
  PhoneTransfer,
  VideoCameraSlash,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";

type Props = {
  call?: ActiveCall | OutgoingCall;
};

export function CallButtons({ call }: Props) {
  const middleware = useMiddleware();
  const [actionMade, setActionMade] = useState(false);
  const [muted, setMuted] = useState(false);

  // Numa chamada ainda não atendida o botão vermelho cancela, e o cancelamento pode ser
  // recusado (ver CallController.cancel) — por isso o botão volta, e não trava.
  const isOutgoing = call?.direction === "OUTGOING" && call.status !== "ACTIVE";

  const hangUpLabel = actionMade && isOutgoing ? t("Canceling...") : isOutgoing ? t("Cancel call") : t("End");

  const hangUp = async () => {
    setActionMade(true);
    const { error } = isOutgoing ? await middleware.controllers.call.cancel() : await middleware.controllers.call.end();
    if (!error) return;
    setActionMade(false);
    toast.error(isOutgoing ? t("Could not cancel the call") : t("Could not end the call"));
  };

  return (
    <div className="wv:grid wv:grid-cols-3 wv:grid-rows-2 wv:w-full wv:gap-3 wv:mb-15">
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <Pause size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Espera</p>
      </div>

      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:size-[55px]"
          disabled
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <VideoCameraSlash size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Video</p>
      </div>

      {muted ? (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            onClick={() => call?.unmute().then(() => setMuted(false))}
            disabled={actionMade}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold wv:text-[red] ">
              <MicrophoneSlash size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[12px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Falar</p>
        </div>
      ) : (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            onClick={() => call?.mute().then(() => setMuted(true))}
            disabled={actionMade}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
              <Microphone size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[12px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
            Silenciar
          </p>
        </div>
      )}

      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneTransfer size={32} weight="fill" />{" "}
          </p>
        </Button>
        <p className="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">
          Transferir
        </p>
      </div>
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-[55px] wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:bg-[#e7000b]"
          onClick={hangUp}
          disabled={actionMade}
          title={hangUpLabel}
          aria-label={hangUpLabel}
          aria-busy={actionMade && isOutgoing}
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneSlash size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[12px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
          {hangUpLabel}
        </p>
      </div>
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
          disabled
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <DotsNine size={32} />
          </p>
        </Button>
        <p className="wv:text-[12px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Teclado</p>
      </div>
    </div>
  );
}
