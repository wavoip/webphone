import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWavoip } from "@/providers/WavoipProvider";

export default function OutgoingScreen() {
  const { callOutgoing } = useWavoip();

  const [status, setStatus] = useState<null | string>("Ligando");

  useEffect(() => {
    callOutgoing?.onStatus((status) => {
      if (status === "CALLING") {
        setStatus("Ligando");
      }

      if (status === "RINGING") {
        setStatus("Chamando");
      }

      if (status === "FAILED") {
        setStatus("Ocorreu uma falha");
      }
    });

    callOutgoing?.onPeerReject(() => {
      setStatus("Chamada rejeitada");
    });

    callOutgoing?.onUnanswered(() => {
      setStatus("Chamada não antendidada");
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
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start wv:overflow-hidden">
            {status && (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{status}</p>
            )}

            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px]">
              {callOutgoing?.peer.display_name || callOutgoing?.peer.number}
            </MarqueeText>
          </div>
        </div>
      </div>

      <CallButtons call={callOutgoing} />
    </div>
  );
}
