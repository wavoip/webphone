import { MicrophoneIcon, MicrophoneSlashIcon, PhoneSlashIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";

export default function CallScreen() {
  const { callActive } = useWavoip();

  const [muted, setMuted] = useState(callActive?.muted || false);
  const [peerMuted, setPeerMuted] = useState(callActive?.peerMuted || false);
  const [status, setStatus] = useState<null | string>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    callActive?.onPeerMute(() => setPeerMuted(true));
    callActive?.onPeerUnmute(() => setPeerMuted(false));
    callActive?.onError((err) => setStatus(err));

    intervalRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callActive?.onError, callActive?.onPeerMute, callActive?.onPeerUnmute]);

  return (
    <div className="size-full flex flex-col justify-evenly gap-4 px-2">
      <div className="flex flex-col justify-center items-center">
        <p className="text-foreground">{callActive?.peer}</p>
        <div className="relative w-full">
          <UserCircleIcon className="size-full aspect-square fill-muted-foreground" />
          {peerMuted && (
            <MicrophoneSlashIcon className="absolute size-10 p-2 rounded-full bottom-[20%] right-[10%] bg-red-400" />
          )}
        </div>
        <p className="text-foreground">{status || formatDuration(durationSeconds)}</p>
      </div>
      <div className="flex justify-evenly items-center">
        <Button
          type="button"
          className="size-fit aspect-square rounded-full bg-red-500 hover:bg-red-400 hover:cursor-pointer"
          onClick={(e) => {
            e.currentTarget.disabled = true;
            callActive?.end().then(({ err }) => {
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
            onClick={() => {
              callActive?.unmute().then(({ err }) => {
                if (err) {
                  setStatus(err);
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
            onClick={() => {
              callActive?.mute().then(({ err }) => {
                if (err) {
                  setStatus(err);
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

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60 - hours * 60);
  const seconds = duration - minutes * 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
