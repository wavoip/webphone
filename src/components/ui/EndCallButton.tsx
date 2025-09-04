import { PhoneSlashIcon } from "@phosphor-icons/react";
import { usePhone } from "../../providers/ScreenProvider";
import { useWavoip } from "../../providers/WavoipProvider";

export default function EndCallButton() {
  const { setScreen } = usePhone();
  const { callActive, callOutgoing } = useWavoip();

  const handleEndCall = () => {
    if (callActive) {
      callActive.end();
      setScreen("keyboard");
      console.log("Call ended");
    }
    if (callOutgoing) {
      callOutgoing.end();
      setScreen("keyboard");
      console.log("Call ended");
    }
  };

  return (
    <button type="button" onClick={handleEndCall} className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600">
      <PhoneSlashIcon size={32} />
    </button>
  );
}
