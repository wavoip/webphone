import { PhoneIcon, PhoneSlash, PhoneSlashIcon, WhatsappLogo } from "@phosphor-icons/react";
import type { CallActive, CallOffer } from "@wavoip/wavoip-api";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarqueeText from "@/components/MarqueeText";

type Props = {
  offer: CallOffer;
  onCallAccept: (call: CallActive) => {}
};

export function OfferNotification({ offer, onCallAccept }: Props) {
  const [actionMade, setActionMade] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("offer", offer)

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


          {error ? (
            <p className="wv:text-xm wv:text-ellipsis wv:text-red-600">{error}</p>
          ) : (
            <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">
              {offer.peer.number ?? "(11) 97395-1769"}
            </p>
          )}
          <div className="wv:hidden  wv:group-hover/title:block" >
            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:font-normal wv:select-none" >
              {offer.peer.display_name || offer.peer.number || "Leonardo Amaro"}
            </MarqueeText>
          </div>


          <p className="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48" >
            {offer.peer.display_name || offer.peer.number || "Leonardo Amaro"}
          </p>
        </div>
        <div className="wv:flex wv:flex-row wv:gap-2">
          <Button
            type="submit"
            size={"icon"}
            className="wv:text-background wv:p-4 wv:bg-red-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[40px] wv:w-[40px]"
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
            className="wv:text-background wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[40px] wv:w-[40px]"
            disabled={actionMade}
            onClick={() => {
              setActionMade(true);
              offer.accept().then(({ err, call }) => {
                if (err) {
                  setError(err);
                  setActionMade(false);
                  return;
                }

                if (call) {
                  onCallAccept(call);
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
    // <div className="wv:flex wv:justify-between wv:items-center wv:w-full wv:p-2 wv:text-foreground wv:m-1 wv:rounded-md wv:bg-muted wv:shadow-sm">
    //   <div className="wv:flex wv:flex-col">
    //     <p className="wv:text-sm wv:text-ellipsis">{offer.peer.display_name || offer.peer.number}</p>
    //     {error && <p className="wv:text-xm wv:text-ellipsis wv:text-red-600">{error}</p>}
    //   </div>
    //   <div className="wv:flex wv:items-center wv:gap-1">
    //     <Button
    //       type="button"
    //       className="wv:size-fit wv:aspect-square !wv:p-2 wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
    //       disabled={actionMade}
    //       onClick={() => {
    //         setActionMade(true);
    //         offer.reject().then(({ err }) => {
    //           if (err) {
    //             setError(err);
    //             setActionMade(false);
    //             return;
    //           }
    //           toast.dismiss(offer.id);
    //         });
    //       }}
    //     >
    //       <PhoneSlashIcon className="size-4" />
    //     </Button>
    //     <Button
    //       type="button"
    //       className="wv:size-fit wv:aspect-square !wv:p-2 wv:bg-green-500 wv:hover:bg-green-400 wv:hover:cursor-pointer"
    //       disabled={actionMade}
    //       onClick={() => {
    //         setActionMade(true);
    //         offer.accept().then(({ err }) => {
    //           if (err) {
    //             setError(err);
    //             setActionMade(false);
    //             return;
    //           }
    //           toast.dismiss(offer.id);
    //         });
    //       }}
    //     >
    //       <PhoneIcon className="wv:size-4" />
    //     </Button>
    //   </div>
    // </div>
  );
}
