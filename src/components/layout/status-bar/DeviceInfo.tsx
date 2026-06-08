import { PowerIcon, QrCodeIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  settings: {
    showEnable: boolean;
    showRemove: boolean;
  };
  device: DeviceStateEntry;
  setShowQRCode: React.Dispatch<React.SetStateAction<null | string>>;
};

type Status = NonNullable<DeviceStateEntry["status"]>;

function statusTone(status: Status | null, restricted: boolean): { dot: string; label: string } {
  if (restricted) return { dot: "wv:bg-amber-500", label: t("Restricted") };
  switch (status) {
    case "open":
    case "UP":
      return { dot: "wv:bg-emerald-500", label: t("Connected") };
    case "connecting":
      return { dot: "wv:bg-amber-500", label: t("Waiting to link WhatsApp") };
    case "close":
      return { dot: "wv:bg-red-500", label: t("Disconnected") };
    case "error":
      return { dot: "wv:bg-red-500", label: t("Failed") };
    case "disconnected":
    case "hibernating":
      return { dot: "wv:bg-zinc-400", label: t("Disconnected") };
    default:
      return { dot: "wv:bg-zinc-400", label: t("Unknown") };
  }
}

export function DeviceInfo({ device, settings, setShowQRCode }: Props) {
  const { removeDevice, disableDevice, enableDevice } = useWavoip();
  const middleware = useMiddleware();
  const { showEnable, showRemove } = settings;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [waking, setWaking] = useState(false);

  const status = (device.status as Status | null) ?? null;
  const tone = statusTone(status, device.restricted);
  const canWakeUp = !device.restricted && (status === "disconnected" || status === "hibernating");
  const switchDisabled = !(status === "open" || (status as string) === "CONNECTED");

  const onWakeUp = async () => {
    setWaking(true);
    try {
      await middleware.controllers.device.wakeUp(device.token);
    } finally {
      setWaking(false);
    }
  };

  const onCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(device.token);
      toast.success(t("Token copied"));
    } catch {
      toast.error(t("Failed to copy token"));
    }
  };

  return (
    <div
      data-enable={device.enable}
      className="wv:relative wv:flex wv:items-center wv:gap-3 wv:px-3 wv:py-2.5 wv:rounded-md wv:border wv:border-foreground/10 wv:bg-foreground/[0.02] wv:data-[enable=false]:opacity-70 wv:hover:bg-foreground/[0.04] wv:transition-colors"
    >
      <span className={`wv:size-2 wv:rounded-full wv:shrink-0 ${tone.dot}`} aria-hidden />

      <div className="wv:flex wv:flex-col wv:min-w-0 wv:flex-1">
        <div className="wv:flex wv:items-center wv:gap-2 wv:text-sm wv:font-medium wv:text-foreground wv:truncate">
          {device.contact?.phone ?? <span className="wv:text-foreground/60">{tone.label}</span>}
          {device.restricted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <WarningIcon size={14} weight="fill" className="wv:text-amber-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{t("Restricted")}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onCopyToken}
              className="wv:text-[11px] wv:text-foreground/50 wv:font-mono wv:truncate wv:text-left wv:hover:text-foreground wv:hover:cursor-pointer wv:max-w-full"
            >
              {device.token}
            </button>
          </TooltipTrigger>
          <TooltipContent>{t("Copy token")}</TooltipContent>
        </Tooltip>
      </div>

      <div className="wv:flex wv:items-center wv:gap-1 wv:shrink-0">
        {canWakeUp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="wv:size-7 wv:hover:cursor-pointer wv:disabled:cursor-wait"
                onClick={onWakeUp}
                disabled={waking}
              >
                <PowerIcon size={14} className={waking ? "wv:animate-pulse" : ""} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("Power on device")}</TooltipContent>
          </Tooltip>
        )}

        {device.qrCode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="wv:size-7 wv:hover:cursor-pointer"
                onClick={() => setShowQRCode(device.qrCode ?? null)}
              >
                <QrCodeIcon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("Show QR Code")}</TooltipContent>
          </Tooltip>
        )}

        {showEnable && (
          <Switch
            className="wv:hover:cursor-pointer"
            checked={device.enable}
            onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
            disabled={switchDisabled}
          />
        )}

        {showRemove && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="wv:size-7 wv:text-red-500 wv:hover:bg-red-500/10 wv:hover:text-red-500 wv:hover:cursor-pointer"
                onClick={() => setConfirmDelete(true)}
              >
                <TrashIcon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("Delete")}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {confirmDelete && (
        <div className="wv:absolute wv:inset-0 wv:flex wv:items-center wv:justify-between wv:gap-2 wv:px-3 wv:rounded-md wv:bg-red-500 wv:text-white">
          <p className="wv:text-sm wv:font-medium wv:select-none">{t("Delete this device?")}</p>
          <div className="wv:flex wv:gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="wv:h-7 wv:px-2 wv:text-white wv:hover:bg-white/15 wv:hover:text-white wv:hover:cursor-pointer"
              onClick={() => setConfirmDelete(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="wv:h-7 wv:px-2 wv:text-white wv:bg-white/15 wv:hover:bg-white/30 wv:hover:text-white wv:hover:cursor-pointer"
              onClick={() => removeDevice(device.token)}
            >
              {t("Delete")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
