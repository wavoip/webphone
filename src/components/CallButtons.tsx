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
import { Button } from "@/components/ui/button";

type Props = {
  call?: CallActive | CallOutgoing;
};

export function CallButtons({ call }: Props) {
  const [actionMade, setActionMade] = useState(false);
  const [muted, setMuted] = useState(false);

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
            disabled={actionMade}
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
            disabled={actionMade}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
              <MicrophoneIcon size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Silenciar</p>
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
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Transferir</p>
      </div>
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant={"secondary"}
          className="wv:aspect-square wv:size-[55px] wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:bg-[#e7000b]"
          onClick={() => {
            setActionMade(true);
            call?.end().finally(() => {
              // setActionMade(false);
            });
          }}
          disabled={actionMade}
        >
          <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
            <PhoneSlashIcon size={32} weight="fill" />
          </p>
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foregroud wv:tracking-[.15em] wv:text-center">Finalizar</p>
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
