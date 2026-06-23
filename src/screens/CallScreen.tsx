import { MicrophoneSlashIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import HangUp from "@/assets/sounds/hangup.mp3";
import Reconnecting from "@/assets/sounds/reconnecting.mp3";
import { CallButtons } from "@/components/CallButtons";
import { CopyablePeer } from "@/components/CopyablePeer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WaveSound } from "@/components/WaveSound";
import { type TranslationKey, t } from "@/lib/i18n";
import { getFullnameLetters } from "@/lib/utils";
import { useWavoip } from "@/providers/WavoipProvider";

const hang_up_sound = new Audio(HangUp);
const reconnecting_sound = new Audio(Reconnecting);

export default function CallScreen() {
  const { callActive, callStatus, peerMuted, callFailReason } = useWavoip();

  const [durationSeconds, setDurationSeconds] = useState(0);
  const durationRef = useRef<number | null>(null);

  const status = useMemo(
    () =>
      callStatus === "ENDED"
        ? t("Call ended")
        : callStatus === "DISCONNECTED"
          ? t("Reconnecting")
          : callStatus === "FAILED"
            ? callFailReason
              ? `${t("The call failed")}: ${t(callFailReason as TranslationKey)}`
              : t("The call failed")
            : null,
    [callStatus, callFailReason],
  );

  useEffect(() => {
    if (callStatus === "ENDED" || callStatus === "FAILED") {
      hang_up_sound.pause();
      hang_up_sound.currentTime = 0;
      hang_up_sound.play();
      reconnecting_sound.onended = null;
      reconnecting_sound.pause();
      reconnecting_sound.currentTime = 0;
      if (durationRef.current) clearInterval(durationRef.current);
    } else if (callStatus === "DISCONNECTED") {
      reconnecting_sound.pause();
      reconnecting_sound.currentTime = 0;
      reconnecting_sound.onended = () => {
        setTimeout(() => {
          reconnecting_sound.currentTime = 0;
          reconnecting_sound.play();
        }, 3000);
      };
      reconnecting_sound.play();
    } else if (callStatus === "ACTIVE") {
      reconnecting_sound.onended = null;
      reconnecting_sound.pause();
      reconnecting_sound.currentTime = 0;
    }
  }, [callStatus]);

  useEffect(() => {
    durationRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, []);

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

            <div className="wv:flex wv:flex-col wv:font-normal wv:w-full">
              <CopyablePeer
                displayName={callActive?.peer.displayName}
                phone={callActive?.peer.phone ?? ""}
                className="wv:text-foreground wv:text-[24px] wv:leading-[28px]"
              />
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
