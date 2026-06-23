import { CopyIcon, EyeIcon, EyeSlashIcon, PhoneIcon, QrCodeIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CopyableText } from "@/components/CopyableText";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLanguage, type TranslationKey, t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  settings: {
    showEnable: boolean;
    showRemove: boolean;
  };
  device: DeviceStateEntry;
  setShowQRCode: React.Dispatch<React.SetStateAction<null | string>>;
};

export function DeviceInfo({ device, settings, setShowQRCode }: Props) {
  const { removeDevice, disableDevice, enableDevice } = useWavoip();
  const middleware = useMiddleware();
  const { root } = useShadowRoot();
  const { showEnable, showRemove } = settings;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const needsWake = device.status === "hibernating";

  return (
    <div
      data-enable={device.enable}
      className="wv:relative wv:flex wv:flex-col wv:gap-3 wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-background/60 wv:data-[enable=false]:opacity-70 wv:rounded-lg wv:border wv:border-border/60 wv:overflow-hidden wv:transition-colors"
    >
      <div className="wv:flex wv:flex-row wv:justify-between wv:items-start wv:gap-4 wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:gap-3">
        <div className="wv:flex wv:flex-col wv:gap-2 wv:min-w-0 wv:flex-1">
          <div className="wv:flex wv:flex-row wv:items-center wv:gap-2">
            {needsWake && (
              <Tooltip>
                <TooltipTrigger
                  aria-label={t("Power on device")}
                  className="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:rounded-full wv:border wv:border-border wv:hover:bg-accent wv:hover:cursor-pointer"
                  onClick={() => middleware.controllers.device.wakeUp(device.token)}
                >
                  <PowerIcon className="wv:size-3.5" />
                </TooltipTrigger>
                <TooltipContent container={root}>
                  <p>{t("Power on device")}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <StatusDot status={device.status} connectionStatus={device.connectionStatus} hasQrCode={!!device.qrCode} />
          </div>

          {device.contact?.phone && <PhoneLine phone={device.contact.phone} />}

          <TokenLine token={device.token} />
        </div>

        <ActionCluster
          showEnable={showEnable}
          showRemove={showRemove}
          device={device}
          root={root}
          onEnable={() => enableDevice(device.token)}
          onDisable={() => disableDevice(device.token)}
          onShowQRCode={() => setShowQRCode(device.qrCode ?? null)}
          onConfirmDelete={() => setConfirmDelete(true)}
        />
      </div>

      {device.restricted && <RestrictionBar until={device.restrictedUntil} />}

      {confirmDelete && (
        <div
          role="alertdialog"
          aria-label={t("Delete this device?")}
          className="wv:absolute wv:inset-0 wv:flex wv:items-center wv:justify-between wv:gap-3 wv:px-4 wv:bg-destructive wv:rounded-lg wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:justify-center wv:max-sm:py-3"
        >
          <p className="wv:font-medium wv:text-destructive-foreground wv:select-none">{t("Delete this device?")}</p>
          <div className="wv:flex wv:flex-row wv:gap-2 wv:max-sm:justify-end">
            <Button
              variant="outline"
              aria-label={t("Delete")}
              className="wv:bg-transparent wv:border-destructive-foreground/60 wv:text-destructive-foreground wv:hover:bg-destructive-foreground/10 wv:hover:text-destructive-foreground wv:cursor-pointer"
              onClick={() => removeDevice(device.token)}
            >
              {t("Delete")}
            </Button>
            <Button
              variant="outline"
              aria-label={t("Cancel")}
              className="wv:bg-transparent wv:border-destructive-foreground/60 wv:text-destructive-foreground wv:hover:bg-destructive-foreground/10 wv:hover:text-destructive-foreground wv:cursor-pointer"
              onClick={() => setConfirmDelete(false)}
            >
              {t("Cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type StatusVisual = { label: TranslationKey; dot: string; pulse: boolean };

function statusVisual(
  status: DeviceStateEntry["status"],
  connectionStatus: DeviceStateEntry["connectionStatus"],
  hasQrCode: boolean,
): StatusVisual {
  // Transport state takes priority — until WS is connected, account status is stale.
  if (connectionStatus === "disconnected") return { label: "Disconnected", dot: "wv:bg-red-500", pulse: false };
  if (connectionStatus === "reconnecting") return { label: "Reconnecting", dot: "wv:bg-amber-500", pulse: true };

  if (status === "open" || status === "UP") return { label: "Connected", dot: "wv:bg-green-500", pulse: false };
  if (status === "BUILDING") return { label: "Building", dot: "wv:bg-foreground/40", pulse: true };
  if (status === "connecting" || hasQrCode) return { label: "Connecting", dot: "wv:bg-blue-500", pulse: true };
  if (status === "restarting") return { label: "Restarting", dot: "wv:bg-blue-500", pulse: true };
  if (status === "hibernating") return { label: "Hibernating", dot: "wv:bg-foreground/40", pulse: false };
  if (status === "close") return { label: "Closed", dot: "wv:bg-foreground/40", pulse: false };
  if (status === "error") return { label: "Failed", dot: "wv:bg-red-500", pulse: false };
  return { label: "Disconnected", dot: "wv:bg-red-500", pulse: false };
}

function StatusDot({
  status,
  connectionStatus,
  hasQrCode,
}: {
  status: DeviceStateEntry["status"];
  connectionStatus: DeviceStateEntry["connectionStatus"];
  hasQrCode: boolean;
}) {
  if (!status) return null;
  const v = statusVisual(status, connectionStatus, hasQrCode);
  return (
    <span className="wv:inline-flex wv:items-center wv:gap-1.5 wv:text-[12px] wv:font-medium wv:text-muted-foreground">
      <span className={`wv:relative wv:inline-flex wv:size-2 wv:rounded-full ${v.dot}`}>
        {v.pulse && (
          <span className={`wv:absolute wv:inset-0 wv:rounded-full wv:animate-ping wv:opacity-60 ${v.dot}`} />
        )}
      </span>
      {t(v.label)}
    </span>
  );
}

function PhoneLine({ phone }: { phone: string }) {
  return (
    <CopyableText value={phone} ariaLabel={t("Copy phone")}>
      <span className="wv:inline-flex wv:items-center wv:gap-2 wv:text-base wv:font-semibold wv:text-foreground">
        <PhoneIcon size={16} weight="fill" className="wv:text-green-500" />
        <span className="wv:truncate">{phone}</span>
      </span>
    </CopyableText>
  );
}

const TOKEN_MASK = "••••••••••••";

function TokenLine({ token }: { token: string }) {
  const [visible, setVisible] = useState(false);
  const { root } = useShadowRoot();

  return (
    <div className="wv:flex wv:flex-row wv:items-center wv:gap-1 wv:min-w-0">
      <span
        title={visible ? token : undefined}
        className="wv:text-[12px] wv:font-mono wv:text-muted-foreground wv:truncate wv:max-w-[18rem] wv:max-sm:max-w-[10rem]"
      >
        {visible ? token : TOKEN_MASK}
      </span>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={visible ? t("Hide token") : t("Show token")}
          className="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:rounded wv:text-muted-foreground wv:hover:bg-foreground/10 wv:hover:text-foreground wv:hover:cursor-pointer"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeSlashIcon className="wv:size-3.5" /> : <EyeIcon className="wv:size-3.5" />}
        </TooltipTrigger>
        <TooltipContent container={root}>
          <p>{visible ? t("Hide token") : t("Show token")}</p>
        </TooltipContent>
      </Tooltip>
      <CopyableText value={token} ariaLabel={t("Copy token")}>
        <span className="wv:inline-flex wv:items-center wv:justify-center wv:size-6 wv:text-muted-foreground wv:hover:text-foreground">
          <CopyIcon className="wv:size-3.5" />
        </span>
      </CopyableText>
    </div>
  );
}

function RestrictionBar({ until }: { until: Date | null }) {
  return (
    <div className="wv:flex wv:flex-row wv:items-center wv:gap-2 wv:px-2.5 wv:py-1.5 wv:rounded-md wv:bg-amber-500/10 wv:border-l-4 wv:border-amber-500">
      <WarningIcon size={16} weight="fill" className="wv:text-amber-500 wv:shrink-0" />
      <span className="wv:text-[12px] wv:font-semibold wv:text-amber-500">{t("Restricted")}</span>
      {until && (
        <span className="wv:text-[11px] wv:text-foreground/70 wv:ml-auto wv:truncate">
          {t("Lifted on")} {formatRestrictionDate(until)}
        </span>
      )}
    </div>
  );
}

function ActionCluster({
  showEnable,
  showRemove,
  device,
  root,
  onEnable,
  onDisable,
  onShowQRCode,
  onConfirmDelete,
}: {
  showEnable: boolean;
  showRemove: boolean;
  device: DeviceStateEntry;
  root: HTMLDivElement;
  onEnable: () => void;
  onDisable: () => void;
  onShowQRCode: () => void;
  onConfirmDelete: () => void;
}) {
  const hasAny = showEnable || device.qrCode || showRemove;
  if (!hasAny) return null;

  const switchDisabled = !["open", "CONNECTED"].includes(device.status as string);

  return (
    <div className="wv:flex wv:items-center wv:gap-3 wv:shrink-0 wv:max-sm:justify-end wv:max-sm:self-end">
      {showEnable && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="wv:inline-flex">
              <Switch
                aria-label={device.enable ? "disable device" : "enable device"}
                className="wv:hover:cursor-pointer wv:data-[state=checked]:!bg-green-500 wv:data-[state=unchecked]:!bg-foreground/25 wv:[&>span]:!bg-white"
                checked={device.enable}
                onCheckedChange={(checked) => (checked ? onEnable() : onDisable())}
                disabled={switchDisabled}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{device.enable ? t("Disable device") : t("Enable device")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {device.qrCode && (
        <Tooltip>
          <TooltipTrigger
            aria-label={t("Show QR Code")}
            className="wv:inline-flex wv:items-center wv:justify-center wv:size-8 wv:rounded-md wv:hover:bg-accent wv:hover:cursor-pointer wv:text-muted-foreground wv:hover:text-foreground"
            onClick={onShowQRCode}
          >
            <QrCodeIcon className="wv:size-4" />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{t("Show QR Code")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showRemove && (
        <Tooltip>
          <TooltipTrigger
            aria-label={t("Delete")}
            className="wv:inline-flex wv:items-center wv:justify-center wv:size-8 wv:rounded-md wv:text-destructive wv:hover:bg-destructive/10 wv:hover:cursor-pointer"
            onClick={onConfirmDelete}
          >
            <TrashIcon className="wv:size-4" />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{t("Delete")}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function formatRestrictionDate(date: Date): string {
  return new Intl.DateTimeFormat(getLanguage(), { dateStyle: "short", timeStyle: "short" }).format(date);
}
