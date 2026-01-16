import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/layout/settings/SettingsModal";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import { Ping } from "@/components/layout/status-bar/Ping";
import { Button } from "@/components/ui/button";
import { mergeToAPI } from "@/lib/webphone-api";
import { useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { startDrag, stopDrag, close } = useWidget();
  const { notifications, settings } = useSettings();
  const { callActive, devices } = useWavoip();

  const [showNotifications, setShowNotifications] = useState<boolean>(notifications.show);
  const [showSettings, setShowSettings] = useState<boolean>(settings.show);

  useEffect(() => {
    console.log("setting status bar settings");
    mergeToAPI({
      settings: {
        showNotifications,
        setShowNotifications: (...args) => setShowNotifications(...args),
        showSettings,
        setShowSettings: (...args) => setShowSettings(...args),
      },
    });
  }, [showSettings, showNotifications]);

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
      className="wv:w-full wv:h-9 wv:bg-background wv:flex wv:justify-between wv:items-center wv:px-2 wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none wv:hover:cursor-pointer wv:shadow-[0_-10px_15px_rgba(0,0,0,0.1)] wv:max-sm:pt-5"
    >
      <div className="wv:flex wv:gap-2">{callActive && <Ping call={callActive} />}</div>
      <div className="wv:flex wv:items-center wv:gap-2">
        {showNotifications && <Notifications />}
        {showSettings && <SettingsModal devices={devices} />}
        <DevicesAlert devices={devices} />
        <Button
          type="button"
          variant={"ghost"}
          className=" wv:size-fit  wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
          onClick={() => close()}
        >
          <XIcon className="wv:max-sm:size-6  wv:pointer-events-none" />
        </Button>
      </div>
    </div>
  );
}
