import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { SettingsModal } from "@/components/layout/settings/SettingsModal";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import { Ping } from "@/components/layout/status-bar/Ping";
import { Button } from "@/components/ui/button";
import { useMiddleware } from "@/middleware/react/hooks";
import { useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { startDrag, stopDrag, close } = useWidget();
  const { notifications, settings } = useSettings();
  const { callActive } = useWavoip();

  const middleware = useMiddleware();
  const showNotifications = useStore(middleware.store, (s) => s.settings.showNotifications);
  const showSettings = useStore(middleware.store, (s) => s.settings.showSettings);
  const setSetting = useStore(middleware.store, (s) => s.setSetting);

  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setSetting("showNotifications", notifications.show);
    setSetting("showSettings", settings.show);
  }, [notifications.show, settings.show, setSetting]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Needs interaction
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
        {showSettings && <SettingsModal />}
        <DevicesAlert />
        <Button
          type="button"
          variant={"ghost"}
          className="wv:size-fit wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
          onClick={() => close()}
        >
          <XIcon className="wv:max-sm:size-6 wv:pointer-events-none" />
        </Button>
      </div>
    </div>
  );
}
