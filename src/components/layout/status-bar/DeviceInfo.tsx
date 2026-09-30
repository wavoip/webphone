import { createSignal, Show } from "solid-js";
import { CopyableText } from "@/components/CopyableText";
import { Copy, Eye, EyeSlash, Phone, Power, QrCode, Trash, Warning } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLanguage, type TranslationKey, t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/solid/context";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
import { useMount } from "@/providers/MountProvider";

type Props = {
  settings: {
    showEnable: boolean;
    showRemove: boolean;
  };
  device: DeviceStateEntry;
  setShowQRCode: (codigo: string | null) => void;
};

export function DeviceInfo(props: Props) {
  const { device: deviceController } = useMiddleware().controllers;
  const { root } = useMount();
  const [confirmDelete, setConfirmDelete] = createSignal(false);

  const device = () => props.device;
  const needsWake = () => device().status === "hibernating";

  return (
    <div
      data-enable={device().enable}
      class="wv:relative wv:flex wv:flex-col wv:gap-3 wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-background/60 wv:data-[enable=false]:opacity-70 wv:rounded-lg wv:border wv:border-border/60 wv:overflow-hidden wv:transition-colors"
    >
      <div class="wv:flex wv:flex-row wv:justify-between wv:items-start wv:gap-4 wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:gap-3">
        <div class="wv:flex wv:flex-col wv:gap-2 wv:min-w-0 wv:flex-1">
          <div class="wv:flex wv:flex-row wv:items-center wv:gap-2">
            <Show when={needsWake()}>
              <Tooltip>
                <TooltipTrigger
                  aria-label={t("Power on device")}
                  class="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:rounded-full wv:border wv:border-border wv:hover:bg-accent wv:hover:cursor-pointer"
                  onClick={() => deviceController.wakeUp(device().token)}
                >
                  <Power class="wv:size-3.5" />
                </TooltipTrigger>
                <TooltipContent container={props.root}>
                  <p>{t("Power on device")}</p>
                </TooltipContent>
              </Tooltip>
            </Show>
            <StatusDot
              status={device().status}
              connectionStatus={device().connectionStatus}
              hasQrCode={!!device().qrCode}
            />
          </div>

          <Show when={device().contact?.phone}>{(phone) => <PhoneLine phone={phone()} />}</Show>

          <TokenLine token={device().token} />
        </div>

        <ActionCluster
          showEnable={props.settings.showEnable}
          showRemove={props.settings.showRemove}
          device={device()}
          root={root}
          onEnable={() => deviceController.enable(device().token)}
          onDisable={() => deviceController.disable(device().token)}
          onShowQRCode={() => props.setShowQRCode(device().qrCode ?? null)}
          onConfirmDelete={() => setConfirmDelete(true)}
        />
      </div>

      <Show when={device().restricted}>
        <RestrictionBar until={device().restrictedUntil} />
      </Show>

      <Show when={confirmDelete()}>
        <div
          role="alertdialog"
          aria-label={t("Delete this device?")}
          class="wv:absolute wv:inset-0 wv:flex wv:items-center wv:justify-between wv:gap-3 wv:px-4 wv:bg-destructive wv:rounded-lg wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:justify-center wv:max-sm:py-3"
        >
          <p class="wv:font-medium wv:text-destructive-foreground wv:select-none">{t("Delete this device?")}</p>
          <div class="wv:flex wv:flex-row wv:gap-2 wv:max-sm:justify-end">
            <Button
              variant="outline"
              aria-label={t("Delete")}
              class="wv:bg-transparent wv:border-destructive-foreground/60 wv:text-destructive-foreground wv:hover:bg-destructive-foreground/10 wv:hover:text-destructive-foreground wv:cursor-pointer"
              onClick={() => deviceController.remove(device().token)}
            >
              {t("Delete")}
            </Button>
            <Button
              variant="outline"
              aria-label={t("Cancel")}
              class="wv:bg-transparent wv:border-destructive-foreground/60 wv:text-destructive-foreground wv:hover:bg-destructive-foreground/10 wv:hover:text-destructive-foreground wv:cursor-pointer"
              onClick={() => setConfirmDelete(false)}
            >
              {t("Cancel")}
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
}

type StatusVisual = { label: TranslationKey; dot: string; pulse: boolean };

function statusVisual(
  status: DeviceStateEntry["status"],
  connectionStatus: DeviceStateEntry["connectionStatus"],
  hasQrCode: boolean,
): StatusVisual {
  // O transporte vem primeiro: até o WS conectar, o status da conta está velho.
  if (connectionStatus === "disconnected") return { label: "Disconnected", dot: "wv:bg-red-500", pulse: false };
  if (connectionStatus === "reconnecting") return { label: "Reconnecting", dot: "wv:bg-amber-500", pulse: true };

  if (status === "open") return { label: "Connected", dot: "wv:bg-green-500", pulse: false };
  if (status === "BUILDING") return { label: "Building", dot: "wv:bg-foreground/40", pulse: true };
  if (status === "connecting" || hasQrCode) return { label: "Connecting", dot: "wv:bg-blue-500", pulse: true };
  if (status === "restarting") return { label: "Restarting", dot: "wv:bg-blue-500", pulse: true };
  if (status === "hibernating") return { label: "Hibernating", dot: "wv:bg-foreground/40", pulse: false };
  if (status === "close") return { label: "Closed", dot: "wv:bg-foreground/40", pulse: false };
  if (status === "error") return { label: "Failed", dot: "wv:bg-red-500", pulse: false };
  return { label: "Disconnected", dot: "wv:bg-red-500", pulse: false };
}

function StatusDot(props: {
  status: DeviceStateEntry["status"];
  connectionStatus: DeviceStateEntry["connectionStatus"];
  hasQrCode: boolean;
}) {
  const v = () => statusVisual(props.status, props.connectionStatus, props.hasQrCode);
  return (
    <Show when={props.status}>
      <span class="wv:inline-flex wv:items-center wv:gap-1.5 wv:text-[12px] wv:font-medium wv:text-muted-foreground">
        <span class={`wv:relative wv:inline-flex wv:size-2 wv:rounded-full ${v().dot}`}>
          <Show when={v().pulse}>
            <span class={`wv:absolute wv:inset-0 wv:rounded-full wv:animate-ping wv:opacity-60 ${v().dot}`} />
          </Show>
        </span>
        {t(v().label)}
      </span>
    </Show>
  );
}

function PhoneLine(props: { phone: string }) {
  return (
    <CopyableText value={props.phone} ariaLabel={t("Copy phone")}>
      <span class="wv:inline-flex wv:items-center wv:gap-2 wv:text-base wv:font-semibold wv:text-foreground">
        <Phone size={16} weight="fill" class="wv:text-green-500" />
        <span class="wv:truncate">{props.phone}</span>
      </span>
    </CopyableText>
  );
}

const TOKEN_MASK = "••••••••••••";

function TokenLine(props: { token: string }) {
  const [visible, setVisible] = createSignal(false);
  const { root } = useMount();

  return (
    <div class="wv:flex wv:flex-row wv:items-center wv:gap-1 wv:min-w-0">
      <span
        title={visible() ? props.token : undefined}
        class="wv:text-[12px] wv:font-mono wv:text-muted-foreground wv:truncate wv:max-w-[18rem] wv:max-sm:max-w-[10rem]"
      >
        {visible() ? props.token : TOKEN_MASK}
      </span>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={visible() ? t("Hide token") : t("Show token")}
          class="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:rounded wv:text-muted-foreground wv:hover:bg-foreground/10 wv:hover:text-foreground wv:hover:cursor-pointer"
          onClick={() => setVisible((v) => !v)}
        >
          <Show when={visible()} fallback={<Eye class="wv:size-3.5" />}>
            <EyeSlash class="wv:size-3.5" />
          </Show>
        </TooltipTrigger>
        <TooltipContent container={props.root}>
          <p>{visible() ? t("Hide token") : t("Show token")}</p>
        </TooltipContent>
      </Tooltip>
      <CopyableText value={props.token} ariaLabel={t("Copy token")}>
        <span class="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:text-muted-foreground wv:hover:text-foreground">
          <Copy class="wv:size-3.5" />
        </span>
      </CopyableText>
    </div>
  );
}

function RestrictionBar(props: { until: Date | null }) {
  return (
    <div class="wv:flex wv:flex-row wv:items-center wv:gap-2 wv:px-2.5 wv:py-1.5 wv:rounded-md wv:bg-amber-500/10 wv:border-l-4 wv:border-amber-500">
      <Warning size={16} weight="fill" class="wv:text-amber-500 wv:shrink-0" />
      <span class="wv:text-[12px] wv:font-semibold wv:text-amber-500">{t("Restricted")}</span>
      <Show when={props.until}>
        {(quando) => (
          <span class="wv:text-[12px] wv:text-foreground/70 wv:ml-auto wv:truncate">
            {t("Lifted on")} {formatRestrictionDate(quando())}
          </span>
        )}
      </Show>
    </div>
  );
}

function ActionCluster(props: {
  showEnable: boolean;
  showRemove: boolean;
  device: DeviceStateEntry;
  root: HTMLDivElement;
  onEnable: () => void;
  onDisable: () => void;
  onShowQRCode: () => void;
  onConfirmDelete: () => void;
}) {
  const hasAny = () => props.showEnable || props.device.qrCode || props.showRemove;
  const switchDisabled = () => !["open", "CONNECTED"].includes(props.device.status as string);

  return (
    <Show when={hasAny()}>
      <div class="wv:flex wv:items-center wv:gap-3 wv:shrink-0 wv:max-sm:justify-end wv:max-sm:self-end">
        <Show when={props.showEnable}>
          <Tooltip>
            <TooltipTrigger
              asChild={(triggerProps) => (
                <span {...triggerProps()} class="wv:inline-flex">
                  <Switch
                    aria-label={props.device.enable ? "disable device" : "enable device"}
                    class="wv:hover:cursor-pointer wv:data-[state=checked]:!bg-green-500 wv:data-[state=unchecked]:!bg-foreground/25 wv:[&>span]:!bg-white"
                    checked={props.device.enable}
                    onCheckedChange={(checked) => (checked ? props.onEnable() : props.onDisable())}
                    disabled={switchDisabled()}
                  />
                </span>
              )}
            />
            <TooltipContent container={props.root}>
              <p>{props.device.enable ? t("Disable device") : t("Enable device")}</p>
            </TooltipContent>
          </Tooltip>
        </Show>

        <Show when={props.device.qrCode}>
          <Tooltip>
            <TooltipTrigger
              aria-label={t("Show QR Code")}
              class="wv:inline-flex wv:items-center wv:justify-center wv:size-8 wv:rounded-md wv:hover:bg-accent wv:hover:cursor-pointer wv:text-muted-foreground wv:hover:text-foreground"
              onClick={props.onShowQRCode}
            >
              <QrCode class="wv:size-4" />
            </TooltipTrigger>
            <TooltipContent container={props.root}>
              <p>{t("Show QR Code")}</p>
            </TooltipContent>
          </Tooltip>
        </Show>

        <Show when={props.showRemove}>
          <Tooltip>
            <TooltipTrigger
              aria-label={t("Delete")}
              class="wv:inline-flex wv:items-center wv:justify-center wv:size-8 wv:rounded-md wv:text-destructive wv:hover:bg-destructive/10 wv:hover:cursor-pointer"
              onClick={props.onConfirmDelete}
            >
              <Trash class="wv:size-4" />
            </TooltipTrigger>
            <TooltipContent container={props.root}>
              <p>{t("Delete")}</p>
            </TooltipContent>
          </Tooltip>
        </Show>
      </div>
    </Show>
  );
}

function formatRestrictionDate(date: Date): string {
  return new Intl.DateTimeFormat(getLanguage(), { dateStyle: "short", timeStyle: "short" }).format(date);
}
