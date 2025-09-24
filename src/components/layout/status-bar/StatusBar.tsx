import { XIcon } from "@phosphor-icons/react";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Ping } from "@/components/layout/status-bar/Ping";
import { SettingsModal } from "@/components/layout/status-bar/SettingsModal";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { root, startDrag, stopDrag, close } = useWidget();
  const { callActive, devices } = useWavoip();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag
    <div
      onMouseUp={(e) => {
        if (e.target !== e.currentTarget) return;
        stopDrag();
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        startDrag(e);
      }}
      className="wv:w-full wv:h-9 wv:bg-[white] wv:flex wv:justify-between wv:items-center wv:px-2 wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none wv:hover:cursor-pointer wv:shadow-[0_-10px_15px_rgba(0,0,0,0.1)]"
    >
      <div className="wv:flex wv:gap-2">{callActive && <Ping call={callActive} />}</div>
      <div className="wv:flex wv:items-center wv:gap-2">
        <SettingsModal devices={devices} root={root} />
        <DevicesAlert devices={devices} />
        <Button
          type="button"
          variant={"ghost"}
          className=" wv:size-fit wv:!p-0.5 wv:aspect-square"
          onClick={() => close()}
        >
          <XIcon size={32} />
        </Button>
      </div>
    </div>
  );
}
