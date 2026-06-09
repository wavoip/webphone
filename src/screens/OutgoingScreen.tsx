import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { useStore } from "zustand";
import Calling from "@/assets/sounds/calling.mp3";
import PostalCode from "@/assets/sounds/postalcode.mp3";
import { CallButtons } from "@/components/CallButtons";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import { getFullnameLetters } from "@/lib/utils";
import { useMiddleware } from "@/middleware/react/hooks";
import { useWavoip } from "@/providers/WavoipProvider";

const calling_sound = new Audio(Calling);
calling_sound.preload = "auto";
const postalcode_sound = new Audio(PostalCode);

export default function OutgoingScreen() {
  const { callOutgoing, callStatus } = useWavoip();
  const middleware = useMiddleware();
  const keyboardInput = useStore(middleware.store, (s) => s.keyboardInput);

  const displayName = callOutgoing?.peer.displayName || callOutgoing?.peer.phone || keyboardInput;

  const status = useMemo(() => {
    if (!callOutgoing && keyboardInput) return t("Connecting...");
    switch (callStatus) {
      case "CALLING":
        return t("Connecting...");
      case "RINGING":
        return t("Calling...");
      case "FAILED":
        return t("The call failed");
      case "REJECTED":
        return t("Call rejected");
      case "NOT_ANSWERED":
        return t("Call unanswered");
      case "ENDED":
        return t("Call ended");
      default:
        return null;
    }
  }, [callStatus, callOutgoing, keyboardInput]);

  useEffect(() => {
    if (callStatus === "RINGING") {
      calling_sound.currentTime = 0;
      calling_sound.volume = 0.25;
      calling_sound.loop = true;
      calling_sound.play();
    } else if (callStatus === "FAILED" || callStatus === "NOT_ANSWERED") {
      calling_sound.pause();
      calling_sound.currentTime = 0;
      postalcode_sound.currentTime = 0;
      postalcode_sound.volume = 0.25;
      postalcode_sound.play();
    } else if (callStatus !== "CALLING") {
      calling_sound.pause();
      calling_sound.currentTime = 0;
      postalcode_sound.pause();
      postalcode_sound.currentTime = 0;
    }

    return () => {
      calling_sound.pause();
      calling_sound.currentTime = 0;
      postalcode_sound.pause();
      postalcode_sound.currentTime = 0;
    };
  }, [callStatus]);

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
            <AvatarFallback>{getFullnameLetters(callOutgoing?.peer?.displayName)}</AvatarFallback>
          </Avatar>
          <div className="wv:hidden  wv:group-hover/title:block">
            <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
              {displayName}
            </MarqueeText>
          </div>
          <div className="wv:flex wv:flex-col wv:justify-center wv:items-start">
            {status && (
              <p className="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{status}</p>
            )}

            <div className="wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
              <div className="wv:hidden  wv:group-hover/title:block">
                <MarqueeText speed={10} className="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {displayName}
                </MarqueeText>
              </div>

              <p className="wv:block wv:group-hover/title:hidden wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
                {displayName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CallButtons call={callOutgoing} />
    </div>
  );
}
