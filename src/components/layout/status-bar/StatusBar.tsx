import { Show } from "solid-js";
import { PictureInPicture, X } from "@/components/icons";
import { SettingsModal } from "@/components/layout/settings/SettingsModal";
import { DevicesAlert } from "@/components/layout/status-bar/DevicesAlert";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import { Ping } from "@/components/layout/status-bar/Ping";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useStore } from "@/middleware/solid/context";
import { useMount } from "@/providers/MountProvider";
import { usePip } from "@/providers/PipProvider";
import { useWidget } from "@/providers/WidgetProvider";

export default function StatusBar() {
  const { startDrag, stopDrag, close } = useWidget();
  const { togglePip } = usePip();
  const state = useStore();
  // Dono da janela não se fecha nem se destaca dela: os dois botões são do widget.
  const isFloating = useMount().layout === "floating";

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
      class={`wv:w-full wv:h-9 wv:bg-background wv:flex wv:justify-between wv:items-center wv:px-2 wv:hover:cursor-pointer wv:shadow-[0_-10px_15px_rgba(0,0,0,0.1)] wv:max-sm:pt-5 ${
        isFloating ? "wv:rounded-2xl wv:rounded-bl-none wv:rounded-br-none" : ""
      }`}
    >
      <div class="wv:flex wv:items-center wv:gap-2">
        <Show when={isFloating}>
          <Button
            type="button"
            variant={"ghost"}
            title={t("Picture-in-picture")}
            aria-label={t("Picture-in-picture")}
            class="wv:size-fit wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
            onClick={() => togglePip()}
          >
            <PictureInPicture class="wv:size-5 wv:max-sm:size-8 wv:pointer-events-none" weight="fill" />
          </Button>
        </Show>
        <Show when={state.active}>{(call) => <Ping call={call()} />}</Show>
      </div>
      <div class="wv:flex wv:items-center wv:gap-2">
        <Show when={state.settings.showNotifications}>
          <Notifications />
        </Show>
        <Show when={state.settings.showSettings}>
          <SettingsModal />
        </Show>
        <DevicesAlert />

        <Show when={isFloating}>
          <Button
            type="button"
            variant={"ghost"}
            title={t("Close")}
            aria-label={t("Close")}
            class="wv:size-fit wv:rounded-full wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:!p-1 wv:max-sm:!p-2 wv:text-foreground"
            onClick={() => close()}
          >
            <X class="wv:max-sm:size-6 wv:pointer-events-none" />
          </Button>
        </Show>
      </div>
    </div>
  );
}
