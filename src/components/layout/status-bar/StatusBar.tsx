import { EyeClosedIcon } from "@phosphor-icons/react";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Ping } from "@/components/layout/status-bar/Ping";
import { SettingsModal } from "@/components/layout/status-bar/SettingsModal";
import { Button } from "@/components/ui/button";
import { useDraggable } from "@/providers/DraggableProvider";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  root: Element;
};

export default function StatusBar({ root }: Props) {
  const { startDrag, stopDrag, close } = useDraggable();
  const { callActive, devices } = useWavoip();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag
    <div
      onMouseUp={stopDrag}
      onMouseDown={startDrag}
      className="wv:w-full wv:h-9 wv:bg-foreground wv:flex wv:justify-between wv:items-center wv:shadow-lg wv:px-2 wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none wv:hover:cursor-pointer"
    >
      <div className="wv:flex wv:items-center">
        <SettingsModal devices={devices} root={root} />
        <DevicesAlert devices={devices} />
      </div>
      <div className="wv:flex wv:gap-2">{callActive && <Ping call={callActive} />}</div>
      <div className="wv:flex wv:items-center">
        <Button
          type="button"
          variant={"ghost"}
          className="wv:text-background wv:size-fit wv:!p-0.5 wv:aspect-square"
          onClick={() => close()}
        >
          <EyeClosedIcon />
        </Button>
      </div>
    </div>
  );
}
