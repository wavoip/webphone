import {
  DotsNineIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PauseIcon,
  PhoneSlashIcon,
  PhoneTransferIcon,
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerNoneIcon,
} from "@phosphor-icons/react";
import type { CallActive, CallOutgoing } from "@wavoip/wavoip-api";
import { useState } from "react";
import { AudioMiniPopover } from "@/components/AudioPopover";
import { Button } from "@/components/ui/button";

type Props = {
  call?: CallActive | CallOutgoing;
};

function getSpeakerVolumeInitial(): number {
  const stored = localStorage.getItem("wavoip:speaker-volume");
  if (!stored) return 80;
  return Number(stored) || 80;
}

const btnBase =
  "wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]";

export function CallButtons({ call }: Props) {
  const [actionMade, setActionMade] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerVolume] = useState(getSpeakerVolumeInitial);

  const SpeakerIcon =
    speakerVolume === 0 ? SpeakerNoneIcon : speakerVolume < 10 ? SpeakerLowIcon : SpeakerHighIcon;

  return (
    <div className="wv:grid wv:grid-cols-3 wv:grid-rows-2 wv:w-full wv:gap-3 wv:mb-15">

      {/* Espera */}
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button type="button" variant="secondary" className={btnBase} disabled>
          <PauseIcon size={32} weight="fill" />
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Espera</p>
      </div>

      {/* Speaker */}
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <div className="wv:relative wv:inline-flex">
          <Button type="button" variant="secondary" className={btnBase} disabled>
            <SpeakerIcon size={32} weight="fill" />
          </Button>
          <AudioMiniPopover
            kind="audiooutput"
            className="wv:absolute wv:-bottom-1 wv:-right-1"
          />
        </div>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Alto-falante</p>
      </div>

      {/* Mic */}
      {muted ? (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <div className="wv:relative wv:inline-flex">
            <Button
              type="button"
              variant="secondary"
              className={btnBase}
              onClick={() => call?.unmute().then(() => setMuted(false))}
              disabled={actionMade}
            >
              <MicrophoneSlashIcon size={32} weight="fill" className="wv:text-red-500" />
            </Button>
            <AudioMiniPopover
              kind="audioinput"
              className="wv:absolute wv:-bottom-1 wv:-right-1"
            />
          </div>
          <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Falar</p>
        </div>
      ) : (
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <div className="wv:relative wv:inline-flex">
            <Button
              type="button"
              variant="secondary"
              className={btnBase}
              onClick={() => call?.mute().then(() => setMuted(true))}
              disabled={actionMade}
            >
              <MicrophoneIcon size={32} weight="fill" />
            </Button>
            <AudioMiniPopover
              kind="audioinput"
              className="wv:absolute wv:-bottom-1 wv:-right-1"
            />
          </div>
          <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Silenciar</p>
        </div>
      )}

      {/* Transferir */}
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button type="button" variant="secondary" className={btnBase} disabled>
          <PhoneTransferIcon size={32} weight="fill" />
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Transferir</p>
      </div>

      {/* Finalizar */}
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button
          type="button"
          variant="secondary"
          className="wv:aspect-square wv:size-[55px] wv:rounded-full wv:hover:bg-red-700 wv:hover:cursor-pointer wv:text-white wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:bg-[#e7000b]"
          onClick={() => {
            setActionMade(true);
            call?.end();
          }}
          disabled={actionMade}
        >
          <PhoneSlashIcon size={32} weight="fill" />
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground wv:tracking-[.15em] wv:text-center">Finalizar</p>
      </div>

      {/* Teclado */}
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <Button type="button" variant="secondary" className={btnBase} disabled>
          <DotsNineIcon size={32} />
        </Button>
        <p className="wv:text-[10px] wv:font-light wv:text-foreground/40 wv:tracking-[.15em] wv:text-center">Teclado</p>
      </div>

    </div>
  );
}
