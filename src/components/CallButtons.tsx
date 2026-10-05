import {
  DotsNineIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PauseIcon,
  PhoneSlashIcon,
  PhoneTransferIcon,
  VideoCameraSlashIcon,
} from "@phosphor-icons/react";
import type { CallActive, CallOutgoing } from "@wavoip/wavoip-api";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import { isTerminalCallStatus } from "@/middleware/store/callStatus";

type Props = {
  call?: CallActive | CallOutgoing;
};

export function CallButtons({ call }: Props) {
  const middleware = useMiddleware();
  const [hangingUp, setHangingUp] = useState(false);
  const [muted, setMuted] = useState(false);
  const callStatus = useStore(middleware.store, (s) => s.callStatus);

  // Numa chamada ainda não atendida o botão vermelho cancela, e não desliga.
  const isOutgoing = call?.direction === "OUTGOING" && call.status !== "ACTIVE";

  // Quem tira o botão de uso é a chamada ter acabado, e não o clique: cancelar pode ser
  // recusado (ver CallController.cancel), e um pedido recusado devolve o botão em vez de
  // deixá-lo desabilitado com a chamada ainda de pé na tela.
  const busy = hangingUp || isTerminalCallStatus(callStatus);

  const hangUpLabel = busy && isOutgoing ? t("Canceling...") : isOutgoing ? t("Cancel call") : t("End");

  const hangUp = async () => {
    setHangingUp(true);
    const { err } = isOutgoing ? await middleware.controllers.call.cancel() : await middleware.controllers.call.end();
    setHangingUp(false);
    if (!err) return;
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
            <PauseIcon size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Espera</p>
      </div>

      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:size-[55px]"
          disabled
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <VideoCameraSlashIcon size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Video</p>
      </div>

      {muted ? (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            onClick={() => call?.unmute().then(() => setMuted(false))}
            disabled={busy}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold wv:text-[red] ">
              <MicrophoneSlashIcon size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Falar</p>
        </div>
      ) : (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            onClick={() => call?.mute().then(() => setMuted(true))}
            disabled={busy}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
              <MicrophoneIcon size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
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
            <PhoneTransferIcon size={32} weight="fill" />{" "}
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">
          Transferir
        </p>
      </div>
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-[55px] wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:bg-[#e7000b]"
          onClick={hangUp}
          disabled={busy}
          title={hangUpLabel}
          aria-label={hangUpLabel}
          aria-busy={busy && isOutgoing}
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneSlashIcon size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">
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
            <DotsNineIcon size={32} />
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Teclado</p>
      </div>
    </div>
  );
}
