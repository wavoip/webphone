import { MicrophoneIcon, MicrophoneSlashIcon, PhoneSlashIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";

export default function OutgoingScreen() {
  const { callOutgoing } = useWavoip();

  const [status, setStatus] = useState<null | string>(null);
  const [muted, setMuted] = useState(callOutgoing?.muted || false);

  return (
    <div className="size-full grid grid-rows-3">
      <div className="text-foreground flex justify-center items-center">
        <p>{status || "Chamando"}</p>
      </div>
      <div className="flex flex-col items-center justify-center text-foreground">
        <UserCircleIcon className="size-full fill-muted-foreground" />
        <p>{callOutgoing?.peer}</p>
      </div>
      <div className="flex w-full justify-evenly items-center">
        <Button
          type="button"
          className="size-fit aspect-square rounded-full bg-red-500 hover:bg-red-400 hover:cursor-pointer"
          onClick={(e) => {
            e.currentTarget.disabled = true;
            callOutgoing?.end().then(({ err }) => {
              if (!err) {
                setStatus("Chamada finalizada");
              }
              e.currentTarget.disabled = false;
            });
          }}
        >
          <PhoneSlashIcon className="size-6" />
        </Button>
        {muted ? (
          <Button
            type="button"
            onClick={(e) => {
              e.currentTarget.disabled = true;
              callOutgoing?.unmute().then(({ err }) => {
                if (err) {
                  setStatus(err);
                  setTimeout(() => setStatus(null), 3000);
                } else {
                  setMuted(false);
                }
              });
            }}
            className="size-fit aspect-square rounded-full bg-red-500 hover:bg-red-400 hover:cursor-pointer"
          >
            <MicrophoneSlashIcon className="size-6" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={(e) => {
              e.currentTarget.disabled = true;
              callOutgoing?.mute().then(({ err }) => {
                if (err) {
                  setStatus(err);
                  setTimeout(() => setStatus(null), 3000);
                } else {
                  setMuted(true);
                }
              });
            }}
            className="size-fit aspect-square rounded-full bg-green-500 hover:bg-green-400 hover:cursor-pointer"
          >
            <MicrophoneIcon className="size-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
