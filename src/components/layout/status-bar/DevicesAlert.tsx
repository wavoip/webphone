import { createMemo, For, Show } from "solid-js";
import { Warning } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type TranslationKey, t } from "@/lib/i18n";
import { useStore } from "@/middleware/solid/context";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";

type Grupo = { titulo: TranslationKey; devices: DeviceStateEntry[] };

export function DevicesAlert() {
  const state = useStore();

  const grupos = createMemo<Grupo[]>(() => {
    const por = (fn: (d: DeviceStateEntry) => boolean) => state.devices.filter(fn);
    return [
      { titulo: "Disconnected devices", devices: por((d) => d.connectionStatus === "disconnected") },
      { titulo: "Devices waiting for QR code", devices: por((d) => d.status === "connecting") },
      { titulo: "Closed devices", devices: por((d) => d.status === "close") },
      { titulo: "Hibernating devices", devices: por((d) => d.status === "hibernating") },
      {
        titulo: "Devices with errors",
        devices: por((d) => d.status === "error" || d.status === "EXTERNAL_INTEGRATION_ERROR"),
      },
    ].filter((grupo) => grupo.devices.length > 0);
  });

  return (
    <Show when={grupos().length > 0}>
      <Tooltip>
        <TooltipTrigger>
          <Warning class="wv:size-6 wv:text-foreground" />
        </TooltipTrigger>
        <TooltipContent class="wv:flex wv:flex-col wv:items-center wv:gap-1">
          <For each={grupos()}>
            {(grupo) => (
              <div class="wv:flex wv:flex-col wv:items-start wv:justify-center">
                <p>{t(grupo.titulo)}</p>
                <div class="wv:flex wv:gap-1">
                  <For each={grupo.devices}>{(device) => <Badge>{device.token}</Badge>}</For>
                </div>
              </div>
            )}
          </For>
        </TooltipContent>
      </Tooltip>
    </Show>
  );
}
