import { PhoneIcon, PhoneXIcon, QrCodeIcon, SpinnerIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CopyableText } from "@/components/CopyableText";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLanguage, t } from "@/lib/i18n";
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

  return (
    <div
      data-enable={device.enable}
      className="wv:relative wv:flex wv:flex-row wv:justify-between wv:items-center wv:gap-3 wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-background/60 wv:data-[enable=false]:opacity-70 wv:rounded-lg wv:border wv:border-border/60 wv:overflow-hidden wv:transition-colors wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:gap-3"
    >
      <div className="wv:flex wv:flex-col wv:gap-1.5 wv:min-w-0 wv:flex-1">
        <DeviceStatus device={device} root={root} onWake={() => middleware.controllers.device.wakeUp(device.token)} />

        {device.restricted && <RestrictionBadge until={device.restrictedUntil} />}

        <CopyableText value={device.token} ariaLabel={t("Copy token")} className="wv:max-w-full wv:min-w-0">
          <span
            data-enable={device.enable}
            title={device.token}
            className="wv:text-[12px] wv:font-mono wv:text-muted-foreground wv:truncate wv:block wv:max-w-[18rem] wv:max-sm:max-w-[10rem]"
          >
            {device.token}
          </span>
        </CopyableText>
      </div>

      <div className="wv:flex wv:gap-2 wv:items-center wv:shrink-0 wv:max-sm:justify-end">
        {showEnable && (
          <Tooltip>
            <TooltipTrigger>
              <Switch
                aria-label={device.enable ? "disable device" : "enable device"}
                className="wv:hover:cursor-pointer wv:data-[state=checked]:!bg-green-500 wv:data-[state=unchecked]:!bg-foreground/25 wv:[&>span]:!bg-white"
                checked={device.enable}
                onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
                disabled={!["open", "CONNECTED"].includes(device.status as string)}
              />
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
              className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:hover:bg-accent wv:hover:cursor-pointer"
              onClick={() => setShowQRCode(device.qrCode ?? null)}
            >
              <QrCodeIcon className="wv:size-5" />
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
              className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:bg-destructive wv:text-destructive-foreground wv:hover:bg-destructive/90 wv:hover:cursor-pointer"
              onClick={() => setConfirmDelete(true)}
            >
              <TrashIcon className="wv:size-5" />
            </TooltipTrigger>
            <TooltipContent container={root}>
              <p>{t("Delete")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

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

function DeviceStatus({
  device,
  onWake,
  root,
}: {
  device: DeviceStateEntry;
  onWake: () => void;
  root: HTMLDivElement;
}) {
  const status = device.status;
  if (!status) return null;

  if (status === "disconnected" || status === "hibernating") {
    return (
      <div className="wv:flex wv:flex-row wv:gap-2 wv:items-center">
        <Tooltip>
          <TooltipTrigger
            aria-label={t("Power on device")}
            className="wv:inline-flex wv:items-center wv:justify-center wv:size-7 wv:rounded-md wv:border wv:border-border wv:hover:bg-accent wv:hover:cursor-pointer"
            onClick={onWake}
          >
            <PowerIcon className="wv:size-4" />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{t("Power on device")}</p>
          </TooltipContent>
        </Tooltip>
        <StatusLine icon={<PhoneIcon size={18} className="wv:text-red-500" />}>
          <PhoneLabel phone={device.contact?.phone} enable={device.enable} fallback={t("Disconnected")} />
        </StatusLine>
      </div>
    );
  }

  if (status === "BUILDING") {
    return (
      <StatusLine icon={<SpinnerIcon size={18} className="wv:text-foreground wv:animate-spin" />}>
        <span data-enable={device.enable} className="wv:font-medium wv:text-foreground">
          {t("Device is building")}
        </span>
      </StatusLine>
    );
  }

  if (status === "connecting" || device.qrCode) {
    return (
      <StatusLine icon={<QrCodeIcon size={18} className="wv:text-foreground" />}>
        <span data-enable={device.enable} className="wv:font-medium wv:text-foreground">
          {t("Waiting to link WhatsApp")}
        </span>
      </StatusLine>
    );
  }

  if (status === "close") {
    return (
      <StatusLine icon={<PhoneXIcon size={18} className="wv:text-red-500" />}>
        <span data-enable={device.enable} className="wv:font-medium wv:data-[enable=false]:text-muted-foreground">
          {t("Disconnected")}
        </span>
      </StatusLine>
    );
  }

  if (status === "error") {
    return (
      <StatusLine icon={<PhoneXIcon size={18} className="wv:text-red-500" />}>
        <span data-enable={device.enable} className="wv:font-medium wv:data-[enable=false]:text-muted-foreground">
          {t("Failed")}
        </span>
      </StatusLine>
    );
  }

  if (status === "open" || status === "UP") {
    return (
      <StatusLine icon={<PhoneIcon size={18} className="wv:text-green-500" />}>
        <PhoneLabel phone={device.contact?.phone} enable={device.enable} />
      </StatusLine>
    );
  }

  return null;
}

function PhoneLabel({ phone, enable, fallback }: { phone?: string; enable: boolean; fallback?: string }) {
  if (!phone) {
    return (
      <span data-enable={enable} className="wv:font-medium wv:text-foreground">
        {fallback}
      </span>
    );
  }
  return (
    <CopyableText value={phone} ariaLabel={t("Copy phone")}>
      <span data-enable={enable} className="wv:font-medium wv:text-foreground">
        {phone}
      </span>
    </CopyableText>
  );
}

function RestrictionBadge({ until }: { until: Date | null }) {
  return (
    <div className="wv:flex wv:flex-row wv:items-center wv:gap-1.5 wv:flex-wrap">
      <span className="wv:inline-flex wv:items-center wv:gap-1 wv:rounded wv:px-1.5 wv:py-0.5 wv:bg-amber-500/15 wv:border-l-4 wv:border-amber-500">
        <WarningIcon size={14} weight="fill" className="wv:text-amber-500" />
        <span className="wv:text-[12px] wv:font-semibold wv:text-amber-500">{t("Restricted")}</span>
      </span>
      {until && (
        <span className="wv:rounded-full wv:bg-amber-500 wv:text-white wv:px-2 wv:py-0.5 wv:text-[11px] wv:font-semibold">
          {t("Lifted on")} {formatRestrictionDate(until)}
        </span>
      )}
    </div>
  );
}

function formatRestrictionDate(date: Date): string {
  return new Intl.DateTimeFormat(getLanguage(), { dateStyle: "short", timeStyle: "short" }).format(date);
}

function StatusLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="wv:flex wv:flex-row wv:gap-1.5 wv:items-center wv:min-w-0">
      {icon}
      <div className="wv:truncate">{children}</div>
    </div>
  );
}
