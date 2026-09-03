import { PhoneIcon, PhoneSlash, WhatsappLogo, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContactAvatar } from "@/components/ContactAvatar";
import MarqueeText from "@/components/MarqueeText";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { IgnorableOffer } from "@/middleware/store/slices/callSlice";

type Props = {
  offer: IgnorableOffer;
};

export function OfferNotification({ offer }: Props) {
  const [showActions, setShowActions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubs = [
      offer.on("ended", () => { setStatus(t("Call ended")); setShowActions(false); }),
      offer.on("acceptedElsewhere", () => { setStatus(t("Accepted by another user")); setShowActions(false); }),
      offer.on("rejectedElsewhere", () => { setStatus(t("Rejected by the app")); setShowActions(false); }),
      offer.on("unanswered", () => { setStatus(t("Timed out")); setShowActions(false); }),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
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
        <ContactAvatar
          className="wv:size-[50px] wv:rounded-xl"
          src={offer.peer?.profilePicture}
          displayName={offer.peer?.displayName}
        />

        <div className="wv:flex-grow wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
          {(error ?? status) ? (
            <>
              {error && <p className="wv:text-xm wv:text-ellipsis wv:text-red-600">{error}</p>}
              {status && <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{status}</p>}
            </>
          ) : (
            <p className="wv:text-foreground wv:opacity-40 wv:text-[14px] wv:select-none">{offer.peer?.phone}</p>
          )}
          <div className="wv:hidden  wv:group-hover/title:block">
            <MarqueeText speed={10} className="wv:text-[24px] wv:leading-[28px] wv:font-normal wv:select-none">
              {offer.peer?.displayName || offer.peer?.phone}
            </MarqueeText>
          </div>

          <p className="wv:block wv:group-hover/title:hidden wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
            {offer.peer?.displayName || offer.peer?.phone}
          </p>
        </div>
        {showActions && (
          <div className="wv:flex wv:flex-row wv:gap-2">
            <Button
              type="submit"
              size={"icon"}
              className="wv:text-[white] wv:p-4 wv:bg-red-500 wv:hover:bg-red-700 wv:active:bg-red-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => {
                setShowActions(false);
                offer.reject().then(({ err }: { err: string | null }) => {
                  if (err) {
                    setError(err);
                    setShowActions(true);
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
              aria-label={t("Ignore")}
              className="wv:text-muted-foreground wv:p-4 wv:bg-muted wv:hover:bg-accent wv:active:bg-accent/60 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => {
                setShowActions(false);
                offer.ignore();
                toast.dismiss(offer.id);
              }}
            >
              <XIcon className="wv:size-5" weight="bold" />
            </Button>
            <Button
              type="submit"
              size={"icon"}
              className="wv:text-[white]  wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:active:bg-green-700 wv:hover:cursor-pointer wv:rounded-full wv:h-[40px] wv:w-[40px]"
              onClick={() => {
                setShowActions(false);
                offer.accept().then((result) => {
                  if (result.err) {
                    setError(result.err);
                    setShowActions(true);
                    return;
                  }
                  toast.dismiss(offer.id);
                });
              }}
            >
              <PhoneIcon className="wv:size-5" weight="fill" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
