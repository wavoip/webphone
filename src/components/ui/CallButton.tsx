import { PhoneOutgoingIcon } from "@phosphor-icons/react";
import { usePhone } from "../../providers/ScreenProvider";
import { useWavoip } from "../../providers/WavoipProvider";

interface Props {
  num: string;
}

export default function CallButton({ num }: Props) {
  const { setScreen } = usePhone();
  const { wavoipInstance, makeCall } = useWavoip();

  async function calling() {
    /*console.log("Ligando...", num);
    setScreen("outgoing");
    const result = await wavoipInstance.startCall({
      fromTokens: [wavoipInstance.getDevices()[0].token],
      to: num, // Número ou ID
    });

    if (result.err) {
      console.error("Erro ao iniciar chamada:", result.err.message);
      result.err.devices.forEach((d) => {
        console.log(`Device ${d.token} falhou: ${d.reason}`);
      });
    } else {
      console.log("Chamada iniciada com sucesso:", result.call);
    }*/
    makeCall?.(num);
  }

  return (
    <button type="button" onClick={calling} className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600">
      <PhoneOutgoingIcon size={32} />
    </button>
  );
}
