import { PhoneIcon, PhoneSlash, WhatsappLogo } from "@phosphor-icons/react";
import type { CallOffer } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MarqueeText from "@/components/MarqueeText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFullnameLetters } from "@/lib/utils";
import { showNameOrNumber, useSettings } from "@/providers/settings/Provider";

type Props = {
  offer: CallOffer;
};

export function OfferNotification({ offer }: Props) {
  const { calls } = useSettings();
  const [actionMade, setActionMade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    offer.onEnd(() => {
      setStatus("Chamada encerrada");
    });

    offer.onAcceptedElsewhere(() => {
      setStatus("Aceita por outro usuário");
    });

    offer.onRejectedElsewhere(() => {
      setStatus("Rejeitada pelo aplicativo");
    });

    offer.onUnanswered(() => {
      setStatus("Tempo limite");
    });
  }, [offer]);

  return (
    <div className="wv:flex wv:flex-col wv:gap-3 wv:w-[365px] wv:bg-background">
      <div className="wv:flex wv:flex-row wv:gap-1">
        <div className="wv:flex wv:flex-row wv:justify-between wv:gap-2 ">
          <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-2 wv:opacity-75 wv:text-foreground">
            <WhatsappLogo size={20} color="currentColor" />

            <p className="wv:text-foreground wv:text-[14px] wv:select-none">Whatsapp Audio</p>
          </div>

          <div className="wv:flex wv:items-center wv:space-x-1">
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce1"></span>
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce2"></span>
            <span className="dot wv:w-1.5 wv:h-1.5 wv:rounded-full wv:bg-foreground animate-bounce3"></span>
          </div>
        </div>
      </div>
      <div className="wv:flex wv:gap-3">
        <Avatar className="wv:size-[50px] wv:rounded-xl">
          <AvatarImage src={offer.peer?.profilePicture ?? ""} />
          <AvatarFallback>{getFullnameLetters(calls.showName ? offer.peer?.displayName : "Oculto")}</AvatarFallback>
        </Avatar>

        <div className="wv:flex-grow wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
          {(error ?? status) ? (
            <>
              {error && <p className="wv:text-xm wv:text-ellipsis wv:text-red-600">{error}</p>}
              {status && <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{status}</p>}
            </>
          ) : (
            <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{calls.showNumber ? offer.peer?.phone : "Oculto"}</p>
          )}
          <div className="wv:hidden  wv:group-hover/title:block">
            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:font-normal wv:select-none">
              {showNameOrNumber(calls, offer)}
            </MarqueeText>
          </div>

          <p className="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
            {showNameOrNumber(calls, offer)}
          </p>
        </div>
        <div className="wv:flex wv:flex-row wv:gap-2">
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-[white] wv:p-4 wv:bg-red-500 wv:hover:bg-red-700 wv:active:bg-red-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
            disabled={actionMade}
            onClick={() => {
              setActionMade(true);
              offer.reject().then(({ err }) => {
                if (err) {
                  setError(err);
                  setActionMade(false);
                  return;
                }
                toast.dismiss(offer.id);
              });
            }}
          >
            <PhoneSlash className="wv:size-5" weight="fill" />
          </Button>
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-[white]  wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:active:bg-green-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
            disabled={actionMade}
            onClick={() => {
              setActionMade(true);
              offer.accept().then(({ err }) => {
                if (err) {
                  setError(err);
                  setActionMade(false);
                  return;
                }
                toast.dismiss(offer.id);
              });
            }}
          >
            <PhoneIcon className="wv:size-5" weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  );
}
