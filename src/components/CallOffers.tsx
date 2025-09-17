import { PhoneIcon, PhoneSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";

export function CallOffers() {
  const { offers } = useWavoip();

  const [actionMade, setActionMade] = useState(false);

  return (
    <div className="wv:absolute wv:top-0 wv:left-0 wv:w-full wv:flex wv:flex-col wv:gap-1">
      {offers.slice(0, 3).map((offer) => (
        <div
          key={offer.id}
          className="wv:flex wv:justify-between wv:items-center wv:p-2 wv:text-foreground wv:m-1 wv:rounded-md wv:bg-muted wv:shadow-sm"
        >
          <p className="wv:text-sm wv:text-ellipsis">{offer.peer}</p>
          <div className="wv:flex wv:items-center wv:gap-1">
            <Button
              type="button"
              className="wv:size-fit wv:aspect-square !wv:p-2 wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
              disabled={actionMade}
              onClick={() => {
                setActionMade(true);
                offer.reject().then(({ err }) => {
                  if (err) {
                    toast.error(err);
                  }
                  setActionMade(false);
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
                    toast.error(err);
                  }
                  setActionMade(false);
                });
              }}
            >
              <PhoneIcon className="wv:size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
