import { QrCode as ArkQrCode } from "@ark-ui/solid/qr-code";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Activity, ArrowLeft, DeviceMobile, Gear, Microphone, Phone, Plus, QrCode, Sliders } from "@/components/icons";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";
import { PreferencesConfig } from "@/components/layout/settings/PreferencesConfig";
import { DeviceInfo } from "@/components/layout/status-bar/DeviceInfo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { useMiddleware, useStore } from "@/middleware/solid/context";
import { useMount } from "@/providers/MountProvider";
import { useSettings } from "@/providers/settings/Provider";
import { DebugScreen } from "@/screens/DebugScreen";

export function SettingsModal() {
  const state = useStore();
  const { root } = useMount();
  const [open, setOpen] = createSignal(false);
  const [qrcode, setQrcode] = createSignal<string | null>(null);

  // O `device:open` limpa o qrCode quando o pareamento termina.
  createEffect(() => {
    const atual = qrcode();
    if (!atual) return;
    if (!state.devices.some((d) => d.qrCode === atual)) setQrcode(null);
  });

  return (
    <Dialog
      modal
      open={open()}
      onOpenChange={(aberto) => {
        if (qrcode() && !aberto) {
          setQrcode(null);
          return;
        }
        setOpen(aberto);
      }}
    >
      <DialogTrigger
        aria-label={t("Settings")}
        class="wv:hover:cursor-pointer wv:hover:bg-background wv:text-foreground wv:hover:text-foreground wv:p-0.5 wv:rounded-full wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:max-sm:p-2 wv:focus-visible:outline-none wv:focus-visible:ring-2 wv:focus-visible:ring-ring"
      >
        <Gear class="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
      </DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        class="wv:flex wv:flex-col wv:gap-0 wv:h-[85vh] wv:max-h-[85vh] wv:sm:max-w-3xl wv:p-0 wv:overflow-hidden wv:max-sm:h-[100vh] wv:max-sm:max-h-[100vh] wv:max-sm:max-w-full wv:max-sm:rounded-none"
      >
        <Show when={qrcode()} fallback={<PainelConfiguracoes onQrCode={setQrcode} />}>
          {(codigo) => <PainelQrCode codigo={codigo()} onVoltar={() => setQrcode(null)} />}
        </Show>
      </DialogContent>
    </Dialog>
  );
}

/** A tela de parear um número novo, que substitui a de configurações enquanto dura. */
function PainelQrCode(props: { codigo: string; onVoltar: () => void }) {
  return (
    <div class="wv:flex wv:flex-col wv:gap-5 wv:p-6 wv:overflow-y-auto wv:max-sm:p-4">
      <DialogHeader class="wv:flex-row wv:items-center wv:gap-3 wv:space-y-0 wv:text-left">
        <button
          type="button"
          aria-label={t("Back")}
          onClick={() => props.onVoltar()}
          class="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:text-muted-foreground wv:hover:bg-accent wv:hover:text-foreground wv:hover:cursor-pointer wv:shrink-0"
        >
          <ArrowLeft class="wv:size-5" />
        </button>
        <div class="wv:flex wv:flex-col wv:gap-0.5 wv:min-w-0 wv:flex-1">
          <DialogTitle class="wv:flex wv:items-center wv:gap-2 wv:text-lg wv:font-semibold wv:text-foreground">
            <QrCode class="wv:size-5 wv:text-green-500" weight="fill" />
            {t("Link a WhatsApp number")}
          </DialogTitle>
          <DialogDescription class="wv:text-sm wv:text-muted-foreground">
            {t("Point your phone camera")}
          </DialogDescription>
        </div>
      </DialogHeader>

      <ol class="wv:flex wv:flex-col wv:gap-2 wv:px-1 wv:text-sm wv:text-muted-foreground">
        <li class="wv:flex wv:items-start wv:gap-2">
          <DeviceMobile class="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
          <span>{t("Open WhatsApp on your phone")}</span>
        </li>
        <li class="wv:flex wv:items-start wv:gap-2">
          <Gear class="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
          <span>{t("Tap menu, then Linked devices")}</span>
        </li>
        <li class="wv:flex wv:items-start wv:gap-2">
          <QrCode class="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
          <span>{t("Point your camera at the code below")}</span>
        </li>
      </ol>

      <div class="wv:flex wv:justify-center">
        <div class="wv:rounded-2xl wv:bg-white wv:p-4 wv:shadow-md wv:max-w-[20rem] wv:w-full">
          <ArkQrCode.Root value={props.codigo} encoding={{ ecc: "M" }} class="wv:size-full">
            <ArkQrCode.Frame class="wv:size-full wv:h-auto">
              <ArkQrCode.Pattern />
            </ArkQrCode.Frame>
          </ArkQrCode.Root>
        </div>
      </div>
    </div>
  );
}

function PainelConfiguracoes(props: { onQrCode: (codigo: string | null) => void }) {
  const middleware = useMiddleware();
  const state = useStore();
  const { audio: audioMenuSettings } = useSettings();
  const showAudio = audioMenuSettings.show;

  const [error, setError] = createSignal("");
  const [token, setToken] = createSignal("");

  // Cópia antes de ordenar: `sort` muda o array no lugar, e este é o do estado.
  const devicesSorted = createMemo(() => [...state.devices].sort((a, b) => Number(b.enable) - Number(a.enable)));

  const addDevice = () => {
    if (!token().trim()) {
      setError(t("Enter the token"));
      return;
    }
    middleware.controllers.device.add(token());
    setToken("");
  };

  return (
    <>
      <DialogHeader class="wv:px-6 wv:pt-6 wv:pb-3 wv:border-b wv:border-border wv:max-sm:px-4 wv:max-sm:pt-4">
        <DialogTitle class="wv:text-lg wv:font-semibold wv:text-foreground">{t("Settings")}</DialogTitle>
        <DialogDescription class="wv:text-sm wv:text-muted-foreground">
          {t("Here you can configure the entire webphone")}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="devices" class="wv:flex wv:flex-1 wv:flex-col wv:gap-0 wv:overflow-hidden">
        <TabsList
          aria-label={t("Settings")}
          class="wv:mx-6 wv:mt-4 wv:h-10 wv:w-auto wv:justify-start wv:max-sm:mx-4 wv:max-sm:w-auto wv:max-sm:overflow-x-auto"
        >
          <Show when={state.settings.showDevices}>
            <TabsTrigger value="devices" class="wv:gap-2 wv:max-sm:min-h-9">
              <Phone class="wv:size-4" weight="duotone" />
              {t("Numbers")}
            </TabsTrigger>
          </Show>
          <Show when={showAudio}>
            <TabsTrigger value="settings" disabled class="wv:gap-2 wv:max-sm:min-h-9">
              <Microphone class="wv:size-4" weight="duotone" />
              Audio
            </TabsTrigger>
          </Show>
          <TabsTrigger value="preferences" class="wv:gap-2 wv:max-sm:min-h-9">
            <Sliders class="wv:size-4" weight="duotone" />
            {t("Preferences")}
          </TabsTrigger>
          <TabsTrigger value="diagnostics" class="wv:gap-2 wv:max-sm:min-h-9">
            <Activity class="wv:size-4" weight="duotone" />
            {t("Diagnostics")}
          </TabsTrigger>
        </TabsList>

        <Show when={state.settings.showDevices}>
          <TabsContent
            value="devices"
            class="wv:flex-1 wv:overflow-auto wv:flex wv:flex-col wv:gap-3 wv:px-6 wv:py-4 wv:max-sm:px-4"
          >
            <Show when={state.settings.showAddDevices}>
              <div class="wv:flex wv:items-center wv:gap-2 wv:sticky wv:top-0 wv:bg-background/95 wv:backdrop-blur wv:pb-2 wv:z-10">
                <Input
                  aria-label="Token"
                  placeholder={error() || "Token"}
                  value={token()}
                  onInput={(e) => {
                    setToken(e.currentTarget.value);
                    if (error()) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addDevice();
                  }}
                  class={`wv:!text-foreground wv:focus-visible:ring-0 wv:flex-1 wv:max-sm:h-10 ${error() ? "wv:border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  aria-label={t("Enter the token")}
                  onClick={addDevice}
                  class="wv:bg-green-500 wv:hover:bg-green-600 wv:h-9 wv:aspect-square wv:p-0 wv:hover:cursor-pointer wv:max-sm:h-10"
                >
                  <Plus class="wv:size-4" />
                </Button>
              </div>
            </Show>

            <Show
              when={devicesSorted().length > 0}
              fallback={<p class="wv:text-xs wv:text-muted-foreground wv:italic wv:py-4 wv:text-center">—</p>}
            >
              <div class="wv:flex wv:flex-col wv:gap-2">
                <For each={devicesSorted()}>
                  {(device) => (
                    <DeviceInfo
                      settings={{
                        showEnable: state.settings.showEnableDevices,
                        showRemove: state.settings.showRemoveDevices,
                      }}
                      device={device}
                      setShowQRCode={props.onQrCode}
                    />
                  )}
                </For>
              </div>
            </Show>
          </TabsContent>
        </Show>

        <Show when={showAudio}>
          <TabsContent value="settings" class="wv:flex-1 wv:overflow-auto wv:px-6 wv:py-4 wv:max-sm:px-4">
            <AudioConfig />
          </TabsContent>
        </Show>

        <TabsContent value="preferences" class="wv:flex-1 wv:overflow-auto wv:px-6 wv:py-4 wv:max-sm:px-4">
          <PreferencesConfig />
        </TabsContent>

        <TabsContent value="diagnostics" class="wv:flex-1 wv:overflow-hidden">
          <DebugScreen />
        </TabsContent>
      </Tabs>
    </>
  );
}
