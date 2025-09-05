import { EyeClosedIcon } from "@phosphor-icons/react";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Ping } from "@/components/layout/status-bar/Ping";
import { SettingsModal } from "@/components/layout/status-bar/SettingsModal";
import { Button } from "@/components/ui/button";
import { useDraggable } from "@/providers/DraggableProvider";
import { useWavoip } from "@/providers/WavoipProvider";

export default function StatusBar() {
  const { startDrag, close } = useDraggable();
  const { callActive, devices } = useWavoip();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag
    <div
      onMouseDown={startDrag}
      className="w-full h-9 bg-foreground flex justify-between items-center shadow-lg px-2 rounded-2xl rounded-bl-none rounded-br-none hover:cursor-pointer"
    >
      <div className="flex items-center">
        <SettingsModal devices={devices} />
        <DevicesAlert devices={devices} />
      </div>
      <div className="flex gap-2">{callActive && <Ping call={callActive} />}</div>
      <div className="flex items-center">
        <Button type="button" variant={"ghost"} className="size-fit !p-0.5 aspect-square" onClick={() => close()}>
          <EyeClosedIcon />
        </Button>
      </div>
    </div>
  );
}
