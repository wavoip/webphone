import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon, QrCodeIcon, TrashIcon } from "@phosphor-icons/react";
import { PowerIcon, SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";
import type { Device } from "@wavoip/wavoip-api";
import { parsePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  settings: { showEnable: boolean; showRemove: boolean };
  device: Device & { enable: boolean };
  setShowQRCode: React.Dispatch<React.SetStateAction<null | string>>;
};

function formatPhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    return parsePhoneNumber(`+${raw.replace(/\D/g, "")}`).formatInternational();
  } catch {
    return raw;
  }
}

type StatusStyle = { label: string; border: string; pill: string };

function getStatusStyle(device: Device & { enable: boolean }): StatusStyle {
  switch (device.status) {
    case "open":
    case "UP":
      return {
        label: "Conectado",
        border: "wv:border-l-green-500",
        pill: "wv:bg-green-100 wv:text-green-700",
      };
    case "connecting":
      return {
        label: "Aguardando QR Code",
        border: "wv:border-l-amber-400",
        pill: "wv:bg-amber-100 wv:text-amber-700",
      };
    case "disconnected":
      // API is already attempting to reconnect automatically
      return {
        label: "Reconectando...",
        border: "wv:border-l-amber-400",
        pill: "wv:bg-amber-100 wv:text-amber-700",
      };
    case "restarting":
      return {
        label: "Reiniciando...",
        border: "wv:border-l-amber-400",
        pill: "wv:bg-amber-100 wv:text-amber-700",
      };
    case "close":
      return {
        label: "Desconectado",
        border: "wv:border-l-red-400",
        pill: "wv:bg-red-100 wv:text-red-600",
      };
    case "hibernating":
      return {
        label: "Hibernando",
        border: "wv:border-l-blue-400",
        pill: "wv:bg-blue-100 wv:text-blue-600",
      };
    case "BUILDING":
      return {
        label: "Configurando...",
        border: "wv:border-l-blue-400",
        pill: "wv:bg-blue-100 wv:text-blue-600",
      };
    case "WAITING_PAYMENT":
      return {
        label: "Pagamento pendente",
        border: "wv:border-l-orange-400",
        pill: "wv:bg-orange-100 wv:text-orange-700",
      };
    case "EXTERNAL_INTEGRATION_ERROR":
      return {
        label: "Token inválido",
        border: "wv:border-l-red-500",
        pill: "wv:bg-red-100 wv:text-red-600",
      };
    case "error":
      return {
        label: "Erro",
        border: "wv:border-l-red-500",
        pill: "wv:bg-red-100 wv:text-red-600",
      };
    default:
      return {
        label: device.status,
        border: "wv:border-l-border",
        pill: "wv:bg-muted wv:text-muted-foreground",
      };
  }
}

export function DeviceInfo({ device, settings, setShowQRCode }: Props) {
  const { removeDevice, disableDevice, enableDevice } = useWavoip();
  const { showEnable, showRemove } = settings;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);

  const phone = formatPhone(device.contact?.phone);
  const { label, border, pill } = getStatusStyle(device);
  const isConnected = ["open", "UP"].includes(device.status);
  const canWakeUp = ["hibernating", "close"].includes(device.status);
  const tokenShort = device.token.length > 24 ? `${device.token.slice(0, 24)}…` : device.token;

  async function handleWakeUp() {
    setWakingUp(true);
    await device.wakeUp();
    setWakingUp(false);
  }

  return (
    <div
      className={`wv:relative wv:flex wv:items-center wv:gap-3 wv:p-3 wv:bg-muted wv:rounded-lg wv:border-l-4 wv:overflow-hidden ${border}`}
    >
      {/* Info */}
      <div className="wv:flex wv:flex-col wv:min-w-0 wv:flex-1 wv:gap-1">
        <p className="wv:text-sm wv:font-medium wv:text-foreground wv:truncate wv:leading-tight">
          {phone ?? tokenShort}
        </p>
        <span
          className={`wv:self-start wv:text-[10px] wv:font-medium wv:px-1.5 wv:py-0.5 wv:rounded-full wv:leading-none ${pill}`}
        >
          {label}
        </span>
        {phone && (
          <p className="wv:text-[10px] wv:font-mono wv:text-muted-foreground wv:truncate">{tokenShort}</p>
        )}
      </div>

      {/* Actions */}
      <div className="wv:flex wv:items-center wv:shrink-0 wv:gap-0.5">
        {canWakeUp && (
          <Button
            variant="ghost"
            size="icon"
            className="wv:size-7 wv:rounded-full wv:text-muted-foreground wv:hover:text-foreground wv:hover:bg-background wv:cursor-pointer"
            onClick={handleWakeUp}
            disabled={wakingUp}
          >
            {wakingUp
              ? <SpinnerGapIcon className="wv:size-3.5 wv:animate-spin" />
              : device.status === "close"
                ? <ArrowClockwiseIcon className="wv:size-3.5" />
                : <PowerIcon className="wv:size-3.5" />
            }
          </Button>
        )}
        {device.qrCode && (
          <Button
            variant="ghost"
            size="icon"
            className="wv:size-7 wv:rounded-full wv:text-amber-500 wv:hover:text-amber-600 wv:hover:bg-amber-50 wv:cursor-pointer"
            onClick={() => setShowQRCode(device.qrCode ?? null)}
          >
            <QrCodeIcon className="wv:size-3.5" />
          </Button>
        )}
        {showEnable && (
          <Switch
            className="wv:cursor-pointer wv:scale-75 wv:origin-right"
            checked={device.enable}
            onCheckedChange={(checked) =>
              checked ? enableDevice(device.token) : disableDevice(device.token)
            }
            disabled={!isConnected}
          />
        )}
        {showRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="wv:size-7 wv:rounded-full wv:text-muted-foreground wv:hover:text-red-500 wv:hover:bg-red-50 wv:cursor-pointer"
            onClick={() => setConfirmDelete(true)}
          >
            <TrashIcon className="wv:size-3.5" />
          </Button>
        )}
      </div>

      {/* Confirm Delete Overlay */}
      {confirmDelete && (
        <div className="wv:absolute wv:inset-0 wv:flex wv:items-center wv:justify-between wv:gap-2 wv:px-3 wv:bg-red-500 wv:rounded-lg">
          <div className="wv:flex wv:items-center wv:gap-1.5 wv:min-w-0">
            <ArrowCounterClockwiseIcon className="wv:size-3 wv:text-white wv:shrink-0" />
            <p className="wv:text-white wv:text-xs wv:font-medium wv:select-none wv:truncate">
              Remover dispositivo?
            </p>
          </div>
          <div className="wv:flex wv:gap-1.5 wv:shrink-0">
            <Button
              size="sm"
              className="wv:h-6 wv:px-2.5 wv:text-[11px] wv:bg-white wv:text-red-600 wv:hover:bg-red-50 wv:font-semibold wv:cursor-pointer wv:rounded-md"
              onClick={() => removeDevice(device.token)}
            >
              Remover
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="wv:h-6 wv:px-2 wv:text-[11px] wv:text-white wv:hover:bg-red-400 wv:hover:text-white wv:cursor-pointer"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
