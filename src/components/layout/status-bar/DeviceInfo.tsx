import {
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  PhoneXIcon,
  QrCodeIcon,
  SpinnerIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
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

  const needsWake = device.status === "disconnected" || device.status === "hibernating";

  return (
    <div
      data-enable={device.enable}
      className="wv:relative wv:flex wv:flex-row wv:justify-between wv:items-center wv:gap-3 wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-background/60 wv:data-[enable=false]:opacity-70 wv:rounded-lg wv:border wv:border-border/60 wv:overflow-hidden wv:transition-colors wv:max-sm:flex-col wv:max-sm:items-stretch wv:max-sm:gap-3"
    >
      <div className="wv:flex wv:flex-col wv:gap-2 wv:min-w-0 wv:flex-1">
        <div className="wv:flex wv:flex-row wv:items-center wv:gap-2 wv:flex-wrap">
          {needsWake && (
            <Tooltip>
              <TooltipTrigger
                aria-label={t("Power on device")}
                className="wv:inline-flex wv:items-center wv:justify-center wv:size-7 wv:rounded-md wv:border wv:border-border wv:hover:bg-accent wv:hover:cursor-pointer"
                onClick={() => middleware.controllers.device.wakeUp(device.token)}
              >
                <PowerIcon className="wv:size-4" />
              </TooltipTrigger>
              <TooltipContent container={root}>
                <p>{t("Power on device")}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <StatusBadge status={device.status} hasQrCode={!!device.qrCode} />
          {device.restricted && <RestrictionBadge until={device.restrictedUntil} />}
        </div>

        {device.contact?.phone && <PhonePill phone={device.contact.phone} enable={device.enable} />}

        <TokenPill token={device.token} enable={device.enable} />
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

type StatusVisual = {
  label: TranslationKey;
  icon: React.ReactNode;
  tone: string;
};

function statusVisual(status: DeviceStateEntry["status"], hasQrCode: boolean): StatusVisual {
  if (status === "open" || status === "UP") {
    return {
      label: "Connected",
      icon: <PhoneIcon size={14} weight="fill" />,
      tone: "wv:bg-green-500/15 wv:text-green-600 wv:border-l-4 wv:border-green-500",
    };
  }
  if (status === "BUILDING") {
    return {
      label: "Building",
      icon: <SpinnerIcon size={14} className="wv:animate-spin" />,
      tone: "wv:bg-foreground/10 wv:text-foreground wv:border-l-4 wv:border-foreground/30",
    };
  }
  if (status === "connecting" || hasQrCode) {
    return {
      label: "Connecting",
      icon: <QrCodeIcon size={14} weight="fill" />,
      tone: "wv:bg-blue-500/15 wv:text-blue-500 wv:border-l-4 wv:border-blue-500",
    };
  }
  if (status === "hibernating") {
    return {
      label: "Hibernating",
      icon: <SpinnerIcon size={14} />,
      tone: "wv:bg-foreground/10 wv:text-muted-foreground wv:border-l-4 wv:border-foreground/30",
    };
  }
  if (status === "error") {
    return {
      label: "Failed",
      icon: <PhoneXIcon size={14} weight="fill" />,
      tone: "wv:bg-red-500/15 wv:text-red-500 wv:border-l-4 wv:border-red-500",
    };
  }
  return {
    label: "Disconnected",
    icon: <PhoneXIcon size={14} weight="fill" />,
    tone: "wv:bg-red-500/15 wv:text-red-500 wv:border-l-4 wv:border-red-500",
  };
}

function StatusBadge({ status, hasQrCode }: { status: DeviceStateEntry["status"]; hasQrCode: boolean }) {
  if (!status) return null;
  const v = statusVisual(status, hasQrCode);
  return (
    <span
      className={`wv:inline-flex wv:items-center wv:gap-1 wv:rounded wv:px-1.5 wv:py-0.5 wv:text-[12px] wv:font-semibold ${v.tone}`}
    >
      {v.icon}
      {t(v.label)}
    </span>
  );
}

function PhonePill({ phone, enable }: { phone: string; enable: boolean }) {
  return (
    <CopyableText value={phone} ariaLabel={t("Copy phone")} className="wv:self-start">
      <span
        data-enable={enable}
        className="wv:inline-flex wv:items-center wv:gap-1.5 wv:rounded-full wv:bg-foreground/5 wv:border wv:border-border/60 wv:px-3 wv:py-1 wv:text-sm wv:font-medium wv:text-foreground"
      >
        <PhoneIcon size={14} weight="fill" className="wv:text-green-500" />
        {phone}
      </span>
    </CopyableText>
  );
}

const TOKEN_MASK = "••••••••••••••••";

function TokenPill({ token, enable }: { token: string; enable: boolean }) {
  const [visible, setVisible] = useState(false);
  const display = visible ? token : TOKEN_MASK;
  const { root } = useShadowRoot();

  return (
    <div className="wv:flex wv:flex-row wv:items-center wv:gap-1 wv:self-start wv:max-w-full wv:min-w-0">
      <CopyableText value={token} ariaLabel={t("Copy token")} className="wv:min-w-0">
        <span
          data-enable={enable}
          title={visible ? token : undefined}
          className="wv:inline-block wv:rounded-full wv:bg-foreground/5 wv:border wv:border-border/60 wv:px-3 wv:py-1 wv:text-[12px] wv:font-mono wv:text-muted-foreground wv:truncate wv:max-w-[18rem] wv:max-sm:max-w-[10rem]"
        >
          {display}
        </span>
      </CopyableText>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={visible ? t("Hide token") : t("Show token")}
          className="wv:inline-flex wv:items-center wv:justify-center wv:size-7 wv:rounded-md wv:text-muted-foreground wv:hover:bg-accent wv:hover:text-foreground wv:hover:cursor-pointer"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeSlashIcon className="wv:size-4" /> : <EyeIcon className="wv:size-4" />}
        </TooltipTrigger>
        <TooltipContent container={root}>
          <p>{visible ? t("Hide token") : t("Show token")}</p>
        </TooltipContent>
      </Tooltip>
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
    <div className="wv:flex wv:items-center wv:gap-1 wv:shrink-0 wv:rounded-lg wv:bg-background/40 wv:border wv:border-border/60 wv:p-1 wv:max-sm:justify-end wv:max-sm:self-end">
      {showEnable && (
        <Tooltip>
          <TooltipTrigger className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:hover:bg-accent wv:hover:cursor-pointer wv:disabled:opacity-50">
            <Switch
              aria-label={device.enable ? "disable device" : "enable device"}
              className="wv:hover:cursor-pointer wv:data-[state=checked]:!bg-green-500 wv:data-[state=unchecked]:!bg-foreground/25 wv:[&>span]:!bg-white"
              checked={device.enable}
              onCheckedChange={(checked) => (checked ? onEnable() : onDisable())}
              disabled={switchDisabled}
            />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{device.enable ? t("Disable device") : t("Enable device")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showEnable && (device.qrCode || showRemove) && <span className="wv:w-px wv:h-6 wv:bg-border" />}

      {device.qrCode && (
        <Tooltip>
          <TooltipTrigger
            aria-label={t("Show QR Code")}
            className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:hover:bg-accent wv:hover:cursor-pointer"
            onClick={onShowQRCode}
          >
            <QrCodeIcon className="wv:size-5" />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{t("Show QR Code")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {device.qrCode && showRemove && <span className="wv:w-px wv:h-6 wv:bg-border" />}

      {showRemove && (
        <Tooltip>
          <TooltipTrigger
            aria-label={t("Delete")}
            className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:bg-destructive wv:text-destructive-foreground wv:hover:bg-destructive/90 wv:hover:cursor-pointer"
            onClick={onConfirmDelete}
          >
            <TrashIcon className="wv:size-5" />
          </TooltipTrigger>
          <TooltipContent container={root}>
            <p>{t("Delete")}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
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
