import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWavoip } from "@/providers/WavoipProvider";

import Calling from "@/assets/sounds/calling.mp3";

const calling_sound = new Audio(Calling);

export default function OutgoingScreen() {
  const { callOutgoing } = useWavoip();

  const [status, setStatus] = useState<null | string>("Ligando...");

  useEffect(() => {
    callOutgoing?.onStatus((status) => {
      if (status === "CALLING") {
        // calling_sound.loop = true;
        setStatus("Ligando...");
      }

      if (status === "RINGING") {
        calling_sound.currentTime = 0;
        calling_sound.play();
        calling_sound.loop = true;
        setStatus("Chamando...");
      }

      if (status === "FAILED") {
        setStatus("A ligação falhou");
      }

      if (status !== "CALLING" && status !== "RINGING") {
        calling_sound.pause();
      }
    });

    callOutgoing?.onPeerReject(() => {
      setStatus("Chamada rejeitada");
    });

    callOutgoing?.onUnanswered(() => {
      setStatus("Chamada não atendida");
    });
  }, [callOutgoing]);

  return (
    <div className="wv:size-full wv:flex wv:flex-col wv:px-2 wv:pt-4">
      <div className="wv:size-full wv:flex wv:flex-col wv:gap-4">
        <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-50 ">
          <WhatsappLogoIcon size={20} />
          <p className="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div className="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <Avatar className="wv:size-[50px] wv:rounded-xl">
            <AvatarImage src={callOutgoing?.peer.profile_picture || undefined} />
            <AvatarFallback>
              {callOutgoing?.peer.display_name?.slice(0, 2) || callOutgoing?.peer.number.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="wv:hidden  wv:group-hover/title:block" >
            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:select-none">
              {callOutgoing?.peer.display_name || callOutgoing?.peer.number}
            </MarqueeText>
          </div>
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start">
            {status && (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{status}</p>
            )}

            <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
              <div className="wv:hidden  wv:group-hover/title:block" >
                <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {callOutgoing?.peer.display_name || callOutgoing?.peer.number}
                </MarqueeText>
              </div>

              <p className="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48" >
                {callOutgoing?.peer.display_name || callOutgoing?.peer.number}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CallButtons call={callOutgoing} />
    </div>
  );
}
