import { PhoneIncomingIcon } from "@phosphor-icons/react";
import { usePhone } from "../../providers/ScreenProvider";
import { useWavoip } from "../../providers/WavoipProvider";

export default function AnswerCallButton() {
  const { setScreen } = usePhone();
  const { offers, setCallActives } = useWavoip();

  const callback = () => {
    console.log("Atendendo chamada...");
    setScreen("call");
    if (offers && offers.length > 0)
      offers[0]
        .accept()
        .then((activeCall) => {
          if (activeCall) {
            console.log("Chamada aceita:", activeCall);
            setCallActives((prev) => [...prev, activeCall]);
          }
        })
        .catch((err) => {
          console.error("Erro ao aceitar a chamada:", err);
          setScreen("keyboard");
        });
  };

  return (
    <button type="button" onClick={callback} className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600">
      <PhoneIncomingIcon size={32} />
    </button>
  );
}
