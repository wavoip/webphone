import { PhoneIcon, PhoneSlash, UserCircleIcon, WhatsappLogo } from "@phosphor-icons/react";
import type { CallOutgoing } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarqueeText from "@/components/MarqueeText";

import PhoneHangup from "../assets/icons/phone_hangup.svg"

export default function IncomingScreen() {
  const { wavoipInstance, callOutgoing, multimediaError } = useWavoip();
  const { setScreen } = useScreen();

  const [status, setStatus] = useState<null | string>(null);
  const [muted, setMuted] = useState(callOutgoing?.muted || false);

  useEffect(() => {
    callOutgoing?.onPeerReject(() => {
      setStatus("Chamada rejeitada");
    });
    callOutgoing?.onUnanswered(() => {
      setStatus("Chamada não antendidada");
    });
  }, [callOutgoing]);

  return (
    <div className="wv:flex wv:flex-col wv:gap-3  wv:max-w-[325px]">
      <div className="wv:flex wv:flex-row wv:gap-1">

        <div className="wv:flex wv:flex-row wv:justify-between  wv:gap-2 ">
          <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-75 wv:text-[#25D366]">
            <WhatsappLogo size={20} />

            <p className="wv:text-[#25D366] wv:text-[14px] wv:select-none">Whatsapp Audio</p>

          </div>

          <div className="wv:flex wv:items-center wv:space-x-1">
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-[#25D36695] animate-bounce1"></span>
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-[#25D36695] animate-bounce2"></span>
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-[#25D36695] animate-bounce3"></span>
          </div>
        </div>
      </div>
      <div className="wv:flex wv:gap-3">
        <Avatar className="wv:size-[50px] wv:rounded-xl">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>


        <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
          <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">
            (11) 97395-1769
          </p>

          <div className="wv:hidden  wv:group-hover/title:block" >
            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:font-normal wv:select-none" >
              Leonardo Amaro
            </MarqueeText>
          </div>


          <p className="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48" >
            Leonardo Amaro
          </p>
        </div>
        <div className="wv:flex wv:flex-row wv:gap-2">
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-background wv:p-4 wv:bg-red-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[40px] wv:w-[40px]"
            disabled={!!multimediaError}
          >
            <PhoneSlash className="wv:size-5" weight="fill" />
          </Button>
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-background wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[40px] wv:w-[40px]"
            disabled={!!multimediaError}
          >
            <PhoneIcon className="wv:size-5" weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  );
}
