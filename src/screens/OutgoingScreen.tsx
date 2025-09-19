import { PhoneSlashIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { CallOutgoing } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function OutgoingScreen() {
  const { wavoipInstance, callOutgoing, multimediaError } = useWavoip();
  const { setScreen } = useScreen();

  const [status, setStatus] = useState<null | string>(null);
  const [muted, setMuted] = useState(callOutgoing?.muted || false);

  useEffect(() => {
    callOutgoing?.onPeerReject(() => {
      setStatus("Chamada rejeitada");
    });
    callOutgoing?.onUnanswered(() => {
      setStatus("Chamada não antendidada");
    });
  }, [callOutgoing]);

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
        <MicrophoneButton
          call={callOutgoing as CallOutgoing}
          muted={muted}
          multimediaError={multimediaError}
          setStatus={setStatus}
          setMuted={setMuted}
          requestMicPerm={wavoipInstance.requestMicrophonePermission}
        />
        <Button
          type="button"
          className="wv:size-fit wv:aspect-square wv:rounded-full wv:bg-red-500 wv:hover:bg-red-400 wv:hover:cursor-pointer"
          onClick={() => {
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
