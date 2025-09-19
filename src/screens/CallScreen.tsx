import { MicrophoneSlashIcon, PhoneSlashIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { CallActive } from "@wavoip/wavoip-api";
import { useEffect, useRef, useState } from "react";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function CallScreen() {
  const { wavoipInstance, callActive, multimediaError } = useWavoip();
  const { setScreen } = useScreen();

  const [muted, setMuted] = useState(callActive?.muted || false);
  const [peerMuted, setPeerMuted] = useState(callActive?.peerMuted || false);
  const [status, setStatus] = useState<null | string>(null);
  const [volume, setVolume] = useState<number[]>(Array(10).map(() => 0));
  const [durationSeconds, setDurationSeconds] = useState(0);
  const durationRef = useRef<number | null>(null);

  useEffect(() => {
    callActive?.onPeerMute(() => setPeerMuted(true));
    callActive?.onPeerUnmute(() => setPeerMuted(false));
    callActive?.onError((err) => setStatus(err));
    callActive?.onEnd(() => setStatus("Chamada encerrada"));
    callActive?.onVolume((volume) => {
      console.log("VOLUME WEBPHONE", volume);
      setVolume((prev) => [...prev.slice(1), Number(volume.toFixed(2))]);
    });

    durationRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callActive?.onError, callActive?.onPeerMute, callActive?.onPeerUnmute, callActive?.onEnd, callActive?.onVolume]);

  return (
    <div className="wv:size-full wv:flex wv:flex-col wv:justify-evenly wv:gap-4 wv:px-2">
      <div className="wv:flex wv:flex-col wv:justify-center wv:items-center">
        <p className="wv:text-foreground">{callActive?.peer}</p>
        <div className="wv:relative wv:w-full">
          <UserCircleIcon className="wv:size-full wv:aspect-square wv:fill-muted-foreground" />
          {peerMuted && (
            <MicrophoneSlashIcon className="wv:absolute wv:size-10 wv:p-2 wv:rounded-full wv:bottom-[20%] wv:right-[10%] wv:bg-red-400" />
          )}
        </div>
        <p className="wv:text-foreground">{status || formatDuration(durationSeconds)}</p>
      </div>
      <div className="wv:flex wv:justify-evenly wv:items-center">
        <MicrophoneButton
          call={callActive as CallActive}
          muted={muted}
          multimediaError={multimediaError}
          setStatus={setStatus}
          setMuted={setMuted}
          requestMicPerm={wavoipInstance.requestMicrophonePermission}
        />
        <Button
          type="button"
          className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
          onClick={(e) => {
            e.currentTarget.disabled = true;
            callActive?.end().then(({ err }) => {
              if (!err) {
                setStatus("Chamada finalizada");
                setTimeout(() => {
                  setScreen("keyboard");
                }, 3000);
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

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60 - hours * 60);
  const seconds = duration - minutes * 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
