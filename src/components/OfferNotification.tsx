import { PhoneIcon, PhoneSlashIcon } from "@phosphor-icons/react";
import type { CallOffer } from "@wavoip/wavoip-api";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  offer: CallOffer;
};

export function OfferNotification({ offer }: Props) {
  const [actionMade, setActionMade] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="wv:flex wv:justify-between wv:items-center wv:w-full wv:p-2 wv:text-foreground wv:m-1 wv:rounded-md wv:bg-muted wv:shadow-sm">
      <div className="wv:flex wv:flex-col">
        <p className="wv:text-sm wv:text-ellipsis">{offer.peer.display_name || offer.peer.number}</p>
        {error && <p className="wv:text-xm wv:text-ellipsis wv:text-red-600">{error}</p>}
      </div>
      <div className="wv:flex wv:items-center wv:gap-1">
        <Button
          type="button"
          className="wv:size-fit wv:aspect-square !wv:p-2 wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
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
          <PhoneSlashIcon className="size-4" />
        </Button>
        <Button
          type="button"
          className="wv:size-fit wv:aspect-square !wv:p-2 wv:bg-green-500 wv:hover:bg-green-400 wv:hover:cursor-pointer"
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
          <PhoneIcon className="wv:size-4" />
        </Button>
      </div>
    </div>
  );
}
