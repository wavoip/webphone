import { XIcon } from "@phosphor-icons/react";
import { DeviceSwitcher } from "@/components/layout/device-switcher/DeviceSwitcher";
import { SettingsModal } from "@/components/layout/settings/SettingsModal";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import { Ping } from "@/components/layout/status-bar/Ping";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/providers/SettingsProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { startDrag, stopDrag, close } = useWidget();
  const { showNotifications, showSettings, showHiddenWebphone } = useSettings();
  const { callActive, devices } = useWavoip();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag
    <div
      onMouseUp={() => {
        stopDrag();
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        startDrag(e);
      }}
      className="wv:w-full wv:h-12 wv:bg-background wv:flex wv:justify-between wv:items-center wv:px-2 wv:py-2 wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none wv:hover:cursor-pointer wv:shadow-[0_-10px_15px_rgba(0,0,0,0.1)] wv:desktop:shadow-none wv:max-sm:pt-5"
    >
      {callActive && <div className="wv:flex wv:gap-2"><Ping call={callActive} /> </div>}
      {!callActive && <div className="wv:flex wv:gap-2">  <div className="wv:flex wv:w-full">
        {" "}
        <DeviceSwitcher />{" "}
      </div> </div>}


      <div className="wv:flex wv:items-center wv:gap-2">
        {showNotifications && <Notifications />}
        {showSettings && <SettingsModal devices={devices} />}
        <DevicesAlert devices={devices} />
        {showHiddenWebphone && (
          <Button
            type="button"
            variant={"ghost"}
            className=" wv:size-fit  wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:desktop:!p-1 wv:text-foreground"
            onClick={() => close()}
          >
            <XIcon className="wv:max-sm:size-6  wv:desktop:size-4 wv:pointer-events-none" />
          </Button>
        )}

      </div>
    </div>
  );
}
