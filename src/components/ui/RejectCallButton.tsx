import { PhoneSlashIcon } from "@phosphor-icons/react";
import { usePhone } from "../../providers/ScreenProvider";
import { useWavoip } from "../../providers/WavoipProvider";

export default function RejectCallButton() {
  const { setScreen } = usePhone();
  const { wavoipInstance, offers } = useWavoip();

  const handleRejectCall = () => {
    if (offers && offers.length > 0) {
      offers[0].reject();
      setScreen("keyboard");
      console.log("Call rejected");
    }
  };

  return (
    <button
      type="button"
      onClick={handleRejectCall}
      className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
    >
      <PhoneSlashIcon size={32} />
    </button>
  );
}
