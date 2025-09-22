import { DotsNine, MicrophoneIcon, MicrophoneSlashIcon, Pause, PhoneSlash, PhoneSlashIcon, PhoneTransfer, UserCircleIcon, VideoCameraSlash, WhatsappLogo } from "@phosphor-icons/react";
import type { CallActive } from "@wavoip/wavoip-api";
import { useEffect, useRef, useState } from "react";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarqueeText from "@/components/MarqueeText";
import WaveSound from "@/components/WaveSound";

export default function CallScreen() {
  const { wavoipInstance, callActive, callOutgoing, multimediaError } = useWavoip();
  const { setScreen } = useScreen();

  // const callActive = {
  //   "id": "13C9BD5E8C6B4D3DC4",
  //   "device_token": "8B0627F9-BEDA-48C2-831E-00C501071364",
  //   "peer": "11973951769",
  //   "direction": "OUTGOING",
  //   "status": "ACTIVE",
  //   "muted": false,
  //   "peerMuted": false,
  //   onPeerMute: () => {

  //   },
  //   onPeerUnmute: () => {

  //   },
  //   onError: () => {

  //   },
  //   onEnd: () => {

  //   }, onVolume: () => {

  //   }
  // }

  const [muted, setMuted] = useState(callActive?.muted || false);
  const [peerMuted, setPeerMuted] = useState(callActive?.peerMuted || false);
  const [status, setStatus] = useState<null | string>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const durationRef = useRef<number | null>(null);

  useEffect(() => {
    if (callActive) {
      setStatus("Active");
    }

    callActive?.onPeerMute(() => setPeerMuted(true));
    callActive?.onPeerUnmute(() => setPeerMuted(false));
    callActive?.onError((err) => setStatus(err));
    callActive?.onEnd(() => setStatus("Chamada encerrada"));


    durationRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callActive?.onError, callActive?.onPeerMute, callActive?.onPeerUnmute, callActive?.onEnd, callActive?.onVolume]);

  useEffect(() => {
    if (callOutgoing) {
      setStatus("Chamando...");
    }

    callOutgoing?.onPeerReject(() => {
      setStatus("Rejeitada");
    });

    callOutgoing?.onUnanswered(() => {
      setStatus("Finalizada");
    });


    console.log("callOutgoing", callOutgoing)
  }, [callOutgoing]);

  return (
    <div className="wv:size-full wv:flex wv:flex-col wv:px-2 wv:pt-4">
      <div className="wv:size-full wv:flex wv:flex-col wv:gap-4">
        <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-50 ">
          <WhatsappLogo size={20} />
          <p className="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div className="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <Avatar className="wv:size-[50px] wv:rounded-xl">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start wv:overflow-hidden">
            {["Chamando..."].includes(status) ? (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{status === "Active" ? formatDuration(durationSeconds) : status}</p>
            ) : (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px]">{status === "Active" ? formatDuration(durationSeconds) : status}</p>
            )}

            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px]">
              {callActive?.peer}
            </MarqueeText>
          </div>
        </div>

        <div className="wv:flex wv:grow-1 wv:justify-center wv:items-end wv:pb-[15px] wv:opacity-80">
          {peerMuted ? (
            <div className="wv:flex wv:h-[40px] wv:items-center wv:justify-cente wv:gap-1">
              <MicrophoneSlashIcon></MicrophoneSlashIcon>
              <p className="wv:text-[16px]">Silenciado</p>
            </div>

          ) : (
            <WaveSound />
          )}

        </div>



      </div>
      <div className="wv:grid wv:grid-cols-3 wv:grid-rows-2 wv:w-full wv:gap-3 wv:mb-15">
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            key={`webphone-keyboard-a`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            // onClick={() => handleClick(num)}
            disabled
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
              <Pause size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Espera</p>
        </div>

        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            key={`webphone-keyboard-a`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            // onClick={() => handleClick(num)}
            disabled
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">
              <VideoCameraSlash size={32} weight="fill" />
            </p>
          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Video</p>
        </div>

        {muted ? (
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
            <Button
              key={`webphone-keyboard-a`}
              type="button"
              variant={"secondary"}
              className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
              onClick={() => callActive?.unmute().then(() => setMuted(false))}
            >
              <p className="wv:text-[24px] wv:leading-6 wv:font-semibold wv:text-[red] "><MicrophoneSlashIcon size={32} weight="fill" /></p>

            </Button>
            <p className="wv:text-[10px] wv:font-light wv:text-muted-40 wv:tracking-[.15em] wv:text-center">Falar</p>
          </div>
        ) : (
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
            <Button
              key={`webphone-keyboard-a`}
              type="button"
              variant={"secondary"}
              className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
              onClick={() => callActive?.mute().then(() => setMuted(true))}
            >
              <p className="wv:text-[24px] wv:leading-6 wv:font-semibold "><MicrophoneIcon size={32} weight="fill" /></p>

            </Button>
            <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Silenciar</p>
          </div>
        )}

        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            key={`webphone-keyboard-a`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            // onClick={() => handleClick(num)}
            disabled
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold "><PhoneTransfer size={32} weight="fill" /> </p>

          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Transferir</p>
        </div>
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            key={`webphone-keyboard-a`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px] wv:bg-[#e7000b] wv:text-[white]"
            onClick={() => callActive?.end()}

          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold "><PhoneSlash size={32} weight="fill" /></p>

          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Finalizar</p>
        </div>
        <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
          <Button
            key={`webphone-keyboard-a`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:h-[55px] wv:w-[55px]"
            // onClick={() => handleClick(num)}
            disabled
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold "><DotsNine size={32} /></p>

          </Button>
          <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:text-center">Teclado</p>
        </div>
      </div>

    </div>
  );
}

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60 - hours * 60);
  const seconds = duration - minutes * 60;

  if (hours) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}
