import { UserCircleIcon } from "@phosphor-icons/react";
import AnswerCallButton from "../components/ui/AnswerCallButton";
import RejectCallButton from "../components/ui/RejectCallButton";
import StatusBar from "../components/ui/StatusBar";
import { useWavoip } from "../providers/WavoipProvider";

export default function IncomingScreen() {
  const { wavoipInstance, offers } = useWavoip();

  return (
    <div className="w-60 h-fit rounded-2xl bg-green-950 flex flex-col items-center shadow-lg">
      <StatusBar />
      <div className="flex flex-row h-15 mt-2">
        <UserCircleIcon size={64} />
        <div className="flex flex-col justify-center ml-4">
          {offers && offers.length > 0 && <p>Recebendo</p>}
          {offers && offers.length > 0 && <p>{offers[callIndex].peer.split("@")[0]}</p>}
        </div>
      </div>
      <div className="flex flex-row w-50 justify-evenly items-center mb-3 mt-1 border-t-2 border-green-900 pt-2">
        <RejectCallButton />
        <AnswerCallButton />
      </div>
    </div>
  );
}
