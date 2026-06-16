import { PhoneIcon, PhoneXIcon, QrCodeIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
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
      className="wv:relative wv:flex wv:justify-between wv:items-center wv:gap-4 wv:flex-wrap wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-background/60 wv:data-[enable=false]:opacity-70 wv:rounded-lg wv:border wv:border-border/60 wv:overflow-hidden wv:transition-colors"
    >
      <div className="wv:flex wv:flex-col wv:gap-1 wv:min-w-0">
        <DeviceStatus device={device} root={root} onWake={() => middleware.controllers.device.wakeUp(device.token)} />

        {device.restricted && (
          <StatusLine icon={<WarningIcon size={18} weight="fill" className="wv:text-amber-500" />}>
            <span className="wv:font-medium wv:text-amber-500">{t("Restricted")}</span>
          </StatusLine>
        )}

        <p
          data-enable={device.enable}
          title={device.token}
          className="wv:text-[12px] wv:font-mono wv:text-muted-foreground wv:truncate wv:max-w-[18rem] wv:max-sm:max-w-[12rem]"
        >
          {device.token}
        </p>
      </div>

      <div className="wv:flex wv:gap-2 wv:items-center">
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
          <span data-enable={device.enable} className="wv:font-medium wv:text-foreground">
            {device.contact?.phone ?? t("Disconnected")}
          </span>
        </StatusLine>
      </div>
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
        <span data-enable={device.enable} className="wv:font-medium wv:text-foreground">
          {device.contact?.phone}
        </span>
      </StatusLine>
    );
  }

  return null;
}

function StatusLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="wv:flex wv:flex-row wv:gap-1.5 wv:items-center wv:min-w-0">
      {icon}
      <div className="wv:truncate">{children}</div>
    </div>
  );
}
