import { PhoneIcon, PhoneSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";

export function CallOffers() {
  const { offers } = useWavoip();

  const [actionMade, setActionMade] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full flex flex-col gap-1">
      {offers.slice(0, 3).map((offer) => (
        <div
          key={offer.id}
          className="flex justify-between items-center p-2 text-foreground m-1 rounded-md bg-muted shadow-sm"
        >
          <p className="text-sm text-ellipsis">{offer.peer}</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              className="size-fit aspect-square !p-2 bg-red-500 hover:bg-red-400 hover:cursor-pointer"
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
              className="size-fit aspect-square !p-2 bg-green-500 hover:bg-green-400 hover:cursor-pointer"
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
              <PhoneIcon className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
