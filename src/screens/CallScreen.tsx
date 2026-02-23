import { MicrophoneSlashIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import HangUp from "@/assets/sounds/hangup.mp3";
import Reconnecting from "@/assets/sounds/reconnecting.mp3";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WaveSound } from "@/components/WaveSound";
import { getFullnameLetters } from "@/lib/utils";
import { useWavoip } from "@/providers/WavoipProvider";

const hang_up_sound = new Audio(HangUp);
const reconnecting_sound = new Audio(Reconnecting);

export default function CallScreen() {
  const { callActive } = useWavoip();

  const [peerMuted, setPeerMuted] = useState(callActive?.peer.muted || false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const durationRef = useRef<number | null>(null);

  useEffect(() => {
    callActive?.onPeerMute(() => setPeerMuted(true));
    callActive?.onPeerUnmute(() => setPeerMuted(false));
    callActive?.onError((err) => setError(err));
    callActive?.onEnd(() => {
      setStatus("Chamada encerrada");
      hang_up_sound.pause();
      hang_up_sound.currentTime = 0;
      hang_up_sound.play();
    });
    callActive?.onStatus((status) => {
      if (status === "DISCONNECTED") {
        setStatus("Reconectando");
        reconnecting_sound.pause();
        reconnecting_sound.currentTime = 0;
        reconnecting_sound.onended = () => {
          setTimeout(() => {
            reconnecting_sound.currentTime = 0;
            reconnecting_sound.play();
          }, 3000);
        };
        reconnecting_sound.play();
      } else {
        setStatus(null);
        reconnecting_sound.onended = null;
        reconnecting_sound.pause();
        reconnecting_sound.currentTime = 0;
      }
    });

    durationRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callActive]);

  return (
    <div className="wv:size-full wv:flex wv:flex-col wv:px-2 wv:pt-4">
      <div className="wv:size-full wv:flex wv:flex-col wv:gap-4">
        <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-50 wv:text-foreground ">
          <WhatsappLogoIcon size={20} />
          <p className="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div className="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <Avatar className="wv:size-[50px] wv:rounded-xl">
            <AvatarImage src={callActive?.peer.profilePicture || undefined} />
            <AvatarFallback>{getFullnameLetters(callActive?.peer?.displayName)}</AvatarFallback>
          </Avatar>
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start wv:overflow-hidden">
            <p className="wv:text-foreground wv:opacity-75 wv:text-[14px]">
              {status || formatDuration(durationSeconds)}
            </p>

            <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:font-normal wv:w-full">
              <div className="wv:hidden  wv:group-hover/title:block ">
                <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {callActive?.peer.displayName || callActive?.peer.phone}
                </MarqueeText>
              </div>

              <p className="wv:block wv:group-hover/title:hidden wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
                {callActive?.peer.displayName || callActive?.peer.phone}
              </p>

              {error && <p className="wv:text-destructive wv:opacity-75 wv:text-xs">{error}</p>}
            </div>
          </div>
        </div>

        <div className="wv:flex wv:grow-1 wv:justify-center wv:items-end wv:pb-[15px] wv:opacity-80">
          {peerMuted ? (
            <div className="wv:flex wv:text-foreground wv:h-[40px] wv:items-center wv:justify-cente wv:gap-1">
              <MicrophoneSlashIcon />
              <p className="wv:text-[16px]">Silenciado</p>
            </div>
          ) : (
            <WaveSound call={callActive} />
          )}
        </div>
      </div>

      <CallButtons call={callActive} />
    </div>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60 - hours * 60);
  const secondsRest = seconds - minutes * 60;

  if (hours) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
  }
}
