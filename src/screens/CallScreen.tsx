import { UserCircleIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import EndCallButton from "../components/ui/EndCallButton";
import MuteButton from "../components/ui/MuteButton";
import StatusBar from "../components/ui/StatusBar";
import { useWavoip } from "../providers/WavoipProvider";

export default function CallScreen() {
  const { callActive } = useWavoip();
  const [durationSeconds, setDurationSeconds] = useState(0);

  const duration = useMemo(() => {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    const formatTime = (num: number) => (num < 10 ? `0${num}` : num);

    return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
  }, [durationSeconds]);

  return (
    <div className="w-60 h-fit rounded-2xl bg-green-950 flex flex-col items-center shadow-lg">
      <StatusBar />
      <div className="flex flex-col justify-center items-center h-30 mt-2">
        <UserCircleIcon size={64} />
        {callActive && <p>{callActive.peer.split("@")[0]}</p>}
        {callActive && <p>{duration}</p>}
      </div>
      <div className="flex flex-row w-50 justify-evenly items-center mb-3 mt-1 border-t-2 border-green-900 pt-2">
        <EndCallButton />
        <MuteButton />
      </div>
    </div>
  );
}
