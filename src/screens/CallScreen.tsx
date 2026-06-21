import { MicrophoneSlashIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import Calling from "@/assets/sounds/calling.mp3";
import HangUp from "@/assets/sounds/hangup.mp3";
import PostalCode from "@/assets/sounds/postalcode.mp3";
import Reconnecting from "@/assets/sounds/reconnecting.mp3";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WaveSound } from "@/components/WaveSound";
import type { CallStatus } from "@/hooks/useCallManager";
import { getSpeakerVolume } from "@/lib/device-settings";
import { getFullnameLetters } from "@/lib/utils";
import { useWavoip } from "@/providers/WavoipProvider";

const calling_sound = new Audio(Calling);
calling_sound.preload = "auto";
const postalcode_sound = new Audio(PostalCode);
const hang_up_sound = new Audio(HangUp);
const reconnecting_sound = new Audio(Reconnecting);

const AVATAR_COLORS = [
  "#F87171", "#FB923C", "#FBBF24", "#A3E635",
  "#34D399", "#22D3EE", "#60A5FA", "#818CF8",
  "#A78BFA", "#F472B6", "#2DD4BF", "#4ADE80",
];

function getAvatarColor(name: string | undefined | null): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getStatusLabel(status: CallStatus): string | null {
  switch (status) {
    case "calling": return "Ligando...";
    case "ringing": return "Chamando...";
    case "reconnecting": return "Reconectando";
    case "ended": return "Chamada encerrada";
    case "failed": return "A ligação falhou";
    case "rejected": return "Chamada rejeitada";
    case "unanswered": return "Chamada não atendida";
    default: return null;
  }
}

export default function CallScreen() {
  const { callActive, callOutgoing, callStatus, peerMuted } = useWavoip();

  const peer = (callActive ?? callOutgoing)?.peer;
  const isActive = !!callActive;

  const [durationSeconds, setDurationSeconds] = useState(0);
  const durationRef = useRef<number | null>(null);

  const statusLabel = getStatusLabel(callStatus);

  useEffect(() => {
    switch (callStatus) {
      case "ringing":
        calling_sound.currentTime = 0;
        calling_sound.volume = 0.25;
        calling_sound.loop = true;
        calling_sound.play();
        break;

      case "failed":
      case "unanswered":
        calling_sound.pause();
        calling_sound.currentTime = 0;
        postalcode_sound.currentTime = 0;
        postalcode_sound.volume = getSpeakerVolume();
        postalcode_sound.play();
        break;

      case "ended":
        calling_sound.pause();
        calling_sound.currentTime = 0;
        hang_up_sound.pause();
        hang_up_sound.currentTime = 0;
        hang_up_sound.volume = getSpeakerVolume();
        hang_up_sound.play();
        reconnecting_sound.onended = null;
        reconnecting_sound.pause();
        reconnecting_sound.currentTime = 0;
        break;

      case "reconnecting":
        calling_sound.pause();
        calling_sound.currentTime = 0;
        reconnecting_sound.pause();
        reconnecting_sound.currentTime = 0;
        reconnecting_sound.onended = () => {
          setTimeout(() => {
            reconnecting_sound.currentTime = 0;
            reconnecting_sound.play();
          }, 3000);
        };
        reconnecting_sound.play();
        break;

      case "active":
        calling_sound.pause();
        calling_sound.currentTime = 0;
        reconnecting_sound.onended = null;
        reconnecting_sound.pause();
        reconnecting_sound.currentTime = 0;
        break;

      default:
        calling_sound.pause();
        calling_sound.currentTime = 0;
        postalcode_sound.pause();
        postalcode_sound.currentTime = 0;
        break;
    }
  }, [callStatus]);

  useEffect(() => {
    if (callStatus === "active") {
      if (durationRef.current === null) {
        setDurationSeconds(0);
        durationRef.current = setInterval(() => {
          setDurationSeconds((prev) => prev + 1);
        }, 1000) as unknown as number;
      }
    } else if (["ended", "failed", "rejected", "unanswered"].includes(callStatus)) {
      if (durationRef.current !== null) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
    }
  }, [callStatus]);

  useEffect(() => {
    return () => {
      if (durationRef.current !== null) clearInterval(durationRef.current);
    };
  }, []);

  return (
    <div className="wv:flex wv:flex-col wv:px-2 wv:pt-4 wv:min-h-[452px]">
      <div className="wv:flex wv:flex-col wv:gap-4">
        <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-50 wv:text-foreground">
          <WhatsappLogoIcon size={20} />
          <p className="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div className="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <Avatar className="wv:size-[50px] wv:rounded-2xl">
            <AvatarImage src={peer?.profilePicture || undefined} className="wv:object-cover" />
            <AvatarFallback
              style={{ backgroundColor: getAvatarColor(peer?.displayName || peer?.phone) }}
              className="wv:text-white wv:font-semibold wv:text-[16px] wv:rounded-2xl"
            >
              {getFullnameLetters(peer?.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start wv:overflow-hidden">
            <p className="wv:text-foreground wv:opacity-75 wv:text-[14px]">
              {statusLabel ?? (isActive ? formatDuration(durationSeconds) : null)}
            </p>

            <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:font-normal wv:w-full">
              <div className="wv:hidden wv:group-hover/title:block">
                <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {peer?.displayName || peer?.phone}
                </MarqueeText>
              </div>
              <p className="wv:block wv:group-hover/title:hidden wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
                {peer?.displayName || peer?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wv:flex wv:flex-1 wv:justify-center wv:items-end wv:pb-[15px] wv:opacity-80">
        {isActive && (peerMuted ? (
          <div className="wv:flex wv:text-foreground wv:h-[40px] wv:items-center wv:justify-center wv:gap-1">
            <MicrophoneSlashIcon />
            <p className="wv:text-[16px]">Silenciado</p>
          </div>
        ) : (
          <WaveSound call={callActive} />
        ))}
      </div>

      <CallButtons call={callActive ?? callOutgoing} />
    </div>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60 - hours * 60);
  const secondsRest = seconds - minutes * 60;

  if (hours) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
}
