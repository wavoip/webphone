import { PhoneIcon, PhoneSlashIcon, UserCircleIcon, WhatsappLogo } from "@phosphor-icons/react";
import type { CallOutgoing } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarqueeText from "@/components/MarqueeText";

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

        <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-75 wv:text-[#25D366]">
          <WhatsappLogo size={20} />
          <p className="wv:text-[#25D366] wv:text-[14px] select-none ">Whatsapp Audio</p>
        </div>
      </div>
      <div className="wv:flex wv:gap-3">
        <Avatar className="wv:size-[50px] wv:rounded-xl">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>


        <div className="wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
          <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:font-normal " >
            Leonardo Amaro
          </MarqueeText>

          <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] select-none">
            +55 (11) 97395-1769
          </p>
        </div>

        <div className="wv:flex wv:flex-row wv:gap-2">
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-background wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[35px] wv:w-[35px]"
            disabled={!!multimediaError}
          >
            <PhoneIcon className="wv:size-5" weight="fill" />
          </Button>
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-background wv:p-4 wv:bg-red-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[35px] wv:w-[35px]"
            disabled={!!multimediaError}
          >
            <PhoneIcon className="wv:size-5" weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  );
}
