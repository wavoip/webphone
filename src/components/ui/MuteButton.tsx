import { MicrophoneIcon, MicrophoneSlashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useWavoip } from "../../providers/WavoipProvider";

export default function MuteButton() {
  const [isMuted, setIsMuted] = useState(false);
  const { callActive } = useWavoip();

  // biome-ignore lint/correctness/useExhaustiveDependencies: The dependency is intentional
  useEffect(() => {
    console.log(isMuted ? "Microfone mutado" : "Microfone desmutado");
    if (callActive && !isMuted) {
      callActive.mute;
    }
    if (callActive && isMuted) {
      callActive.unmute;
    }
  }, [isMuted]);

  return (
    <button type="button" onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-green-900 text-white">
      {!isMuted && <MicrophoneIcon size={32} />}
      {isMuted && <MicrophoneSlashIcon size={32} className="text-red-700" />}
    </button>
  );
}
