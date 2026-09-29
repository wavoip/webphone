import { PictureInPicture, X } from "@/components/icons";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { SettingsModal } from "@/components/layout/settings/SettingsModal";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import { Ping } from "@/components/layout/status-bar/Ping";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import { useMount } from "@/providers/MountProvider";
import { usePip } from "@/providers/PipProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { startDrag, stopDrag, close } = useWidget();
  const { callActive } = useWavoip();
  const { togglePip } = usePip();
  // Dono da janela não se fecha nem se destaca dela: os dois botões são do widget.
  const isFloating = useMount().layout === "floating";

  const middleware = useMiddleware();
  const { showNotifications, showSettings } = useStore(
    middleware.store,
    useShallow((s) => ({
      showNotifications: s.settings.showNotifications,
      showSettings: s.settings.showSettings,
    })),
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: precisa de interação
    <div
      onMouseUp={() => {
        stopDrag();
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        startDrag(e);
      }}
      className={`wv:w-full wv:h-9 wv:bg-background wv:flex wv:justify-between wv:items-center wv:px-2 wv:hover:cursor-pointer wv:shadow-[0_-10px_15px_rgba(0,0,0,0.1)] wv:max-sm:pt-5 ${
        isFloating ? "wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none" : ""
      }`}
    >
      <div className="wv:flex wv:items-center wv:gap-2">
        {isFloating && (
          <Button
            type="button"
            variant={"ghost"}
            title={t("Picture-in-picture")}
            aria-label={t("Picture-in-picture")}
            className="wv:size-fit wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
            onClick={() => togglePip()}
          >
            <PictureInPicture className="wv:size-5 wv:max-sm:size-8 wv:pointer-events-none" weight="fill" />
          </Button>
        )}
        {callActive && <Ping call={callActive} />}
      </div>
      <div className="wv:flex wv:items-center wv:gap-2">
        {showNotifications && <Notifications />}
        {showSettings && <SettingsModal />}
        <DevicesAlert />

        {isFloating && (
          <Button
            type="button"
            variant={"ghost"}
            title={t("Close")}
            aria-label={t("Close")}
            className="wv:size-fit wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
            onClick={() => close()}
          >
            <X className="wv:max-sm:size-6 wv:pointer-events-none" />
          </Button>
        )}
      </div>
    </div>
  );
}
