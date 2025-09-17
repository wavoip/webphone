import { MicrophoneIcon, MicrophoneSlashIcon, PhoneSlashIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function OutgoingScreen() {
  const { callOutgoing } = useWavoip();
  const { setScreen } = useScreen();

  const [status, setStatus] = useState<null | string>(null);
  const [muted, setMuted] = useState(callOutgoing?.muted || false);

  return (
    <div className="wv:flex-1 wv:flex wv:flex-col wv:justify-evenly">
      <div className="wv:text-foreground wv:flex wv:justify-center wv:items-center">
        <p>{status || "Chamando"}</p>
      </div>
      <div className="wv:flex wv:flex-col wv:items-center wv:justify-center wv:text-foreground">
        <UserCircleIcon className="wv:size-full wv:fill-muted-foreground" />
        <p>{callOutgoing?.peer}</p>
      </div>
      <div className="wv:flex wv:w-full wv:justify-evenly wv:items-center">
        {muted ? (
          <Button
            type="button"
            variant={"secondary"}
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
            className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
          >
            <MicrophoneSlashIcon className="wv:size-6" />
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
            className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-green-500 wv:hover:bg-green-400 wv:hover:cursor-pointer"
          >
            <MicrophoneIcon className="wv:size-6" />
          </Button>
        )}
        <Button
          type="button"
          className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
          onClick={(e) => {
            e.currentTarget.disabled = true;
            callOutgoing?.end().then(({ err }) => {
              if (!err) {
                setStatus("Chamada finalizada");
                setTimeout(() => {
                  setScreen("keyboard");
                }, 2000);
              }
            });
          }}
        >
          <PhoneSlashIcon className="wv:size-6" />
        </Button>
      </div>
    </div>
  );
}
