import { ArrowsOutCardinalIcon, EyeClosedIcon } from "@phosphor-icons/react";
import { DevicesInfo } from "@/components/layout/status-bar/DevicesInfo";
import { Ping } from "@/components/layout/status-bar/Ping";
import { useDraggable } from "@/providers/DraggableProvider";
import { usePhone } from "@/providers/ScreenProvider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function StatusBar() {
  const { startDrag } = useDraggable();
  const { setScreen } = usePhone();
  const { callActive, devices } = useWavoip();

  return (
    <div className="w-full h-6 bg-foreground flex justify-between shadow-lg px-2 rounded-2xl rounded-bl-none rounded-br-none">
      <div>
        <DevicesInfo devices={devices} />
      </div>
      <div className="flex gap-2">{callActive && <Ping call={callActive} />}</div>
      <div>
        <button type="button" onMouseDown={startDrag} className="active:bg-green-800 rounded-2xl">
          <ArrowsOutCardinalIcon size={24} />
        </button>
        <button type="button" onClick={() => setScreen("closed")}>
          <EyeClosedIcon size={24} />
        </button>
      </div>
    </div>
  );
}
