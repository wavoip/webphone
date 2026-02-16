import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Calling from "@/assets/sounds/calling.mp3";
import PostalCode from "@/assets/sounds/postalcode.mp3";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullnameLetters } from "@/lib/utils";
import { showNameOrNumber, useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function OutgoingScreen() {
  const { callOutgoing } = useWavoip();
  const { calls } = useSettings();
  const calling_sound = new Audio(Calling);
  calling_sound.preload = "auto";
  const postalcode_sound = new Audio(PostalCode);
  const [status, setStatus] = useState<null | string>("Ligando...");

  useEffect(() => {
    callOutgoing?.onStatus((status) => {
      if (status === "CALLING") {
        setStatus("Ligando...");
        return;
      }

      if (status === "RINGING") {
        calling_sound.currentTime = 0;
        calling_sound.volume = 0.25;
        calling_sound.loop = true;
        calling_sound.play();
        setStatus("Chamando...");
        return;
      }

      if (status === "FAILED") {
        postalcode_sound.currentTime = 0;
        postalcode_sound.volume = 0.25;
        postalcode_sound.play();
        setStatus("A ligação falhou");
        return;
      }

      calling_sound.pause();
      calling_sound.currentTime = 0;
      calling_sound.src = "";
      postalcode_sound.pause();
      postalcode_sound.currentTime = 0;
    });

    callOutgoing?.onPeerReject(() => {
      setStatus("Chamada rejeitada");
    });

    callOutgoing?.onUnanswered(() => {
      setStatus("Chamada não atendida");
      postalcode_sound.currentTime = 0;
      postalcode_sound.volume = 0.25;
      postalcode_sound.play();
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
            <AvatarImage src={callOutgoing?.peer.profilePicture || undefined} />
            <AvatarFallback>
              {calls.showName ? getFullnameLetters(callOutgoing?.peer?.displayName) : "Oculto"}
            </AvatarFallback>
          </Avatar>
          <div className="wv:hidden  wv:group-hover/title:block">
            <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
              {showNameOrNumber(calls, callOutgoing)}
            </MarqueeText>
          </div>
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start">
            {status && (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{status}</p>
            )}

            <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
              <div className="wv:hidden  wv:group-hover/title:block">
                <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {showNameOrNumber(calls, callOutgoing)}
                </MarqueeText>
              </div>

              <p className="wv:block wv:group-hover/title:hidden wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
                {showNameOrNumber(calls, callOutgoing)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CallButtons call={callOutgoing} />
    </div>
  );
}
