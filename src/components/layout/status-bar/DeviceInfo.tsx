import { PhoneIcon, PhoneXIcon, QrCodeIcon, TrashIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import type { Device } from "@wavoip/wavoip-api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  settings: {
    showEnable: boolean;
    showRemove: boolean;
  };
  device: Device & { enable: boolean };
  setShowQRCode: React.Dispatch<React.SetStateAction<null | string>>;
};

export function DeviceInfo({ device, settings, setShowQRCode }: Props) {
  const { removeDevice, disableDevice, enableDevice } = useWavoip();
  const { showEnable, showRemove } = settings;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      data-enable={device.enable}
      className="wv:relative wv:flex wv:justify-between wv:items-center wv:gap-2 wv:p-4 wv:bg-muted wv:data-[enable=false]:bg-muted-foreground/30 wv:rounded-md wv:overflow-hidden"
    >
      <div className="wv:flex wv:flex-col wv:gap-1">
        {device.status && (
          <>
            {["disconnected", "hibernating"].includes(device.status) && (
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant={"outline"}
                    className="wv:size-fit !wv:p-0.5 wv:aspect-square wv:hover:cursor-pointer"
                    onClick={() => device.wakeUp()}
                  >
                    <PowerIcon />
                  </Button>
                  <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
                    <PhoneIcon size={18} color="red" />
                    <p data-enable={device.enable} className="wv:font-medium wv:text-foreground">
                      {device.contact.unofficial?.phone}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ligar Dispositivo</p>
                </TooltipContent>
              </Tooltip>
            )}
            {(["connecting"].includes(device.status) || device.qrcode) && (
              <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
                <QrCodeIcon size={18} />
                <p data-enable={device.enable} className="wv:font-medium wv:text-foreground">
                  Aguardando vincular Whatsapp
                </p>
              </div>
            )}
            {["close"].includes(device.status) && (
              <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
                <PhoneXIcon size={18} color="red" />
                <p data-enable={device.enable} className="wv:font-medium wv:data-[enable=false]:text-muted-foreground">
                  Desconectado
                </p>
              </div>
            )}
            {["error"].includes(device.status) && (
              <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
                <PhoneXIcon size={18} color="red" />
                <p data-enable={device.enable} className="wv:font-medium wv:data-[enable=false]:text-muted-foreground">
                  Falha
                </p>
              </div>
            )}
            {["open", "UP"].includes(device.status) && (
              <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
                <PhoneIcon size={18} color="green" />
                <p data-enable={device.enable} className="wv:font-medium wv:text-foreground">
                  {device.contact.unofficial?.phone}
                </p>
              </div>
            )}
          </>
        )}

        <p data-enable={device.enable} className="wv:text-[12px] wv:text-foreground">
          {device.token}
        </p>
      </div>
      <div className="wv:flex wv:gap-2 wv:items-center">
        {showEnable && (
          <Switch
            className="wv:hover:cursor-pointer"
            checked={device.enable}
            onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
            disabled={!["open", "CONNECTED"].includes(device.status as string)}
          />
        )}

        {device.qrcode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                className="wv:size-fit !wv:p-1.5 wv:aspect-square wv:hover:cursor-pointer wv:bg-red"
                onClick={() => setShowQRCode(device.qrcode)}
              >
                <QrCodeIcon className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mostrar QRCode</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showRemove && (
          <Button
            variant={"destructive"}
            className="wv:size-fit !wv:p-1.5 wv:aspect-square wv:hover:cursor-pointer"
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            <TrashIcon />
          </Button>
        )}
      </div>

      {confirmDelete && (
        <div className="wv:absolute wv:flex wv:bg-[#ef4444] wv:w-full wv:h-full wv:left-0  wv:border wv:border-[white] wv:rounded-md wv:items-center wv:p-4">
          <div className="wv:flex wv:flex-row wv:gap-1 wv:w-full wv:justify-between">
            <div className="wv:flex wv:flex-row wv:gap-1 wv:items-center">
              <p data-enable={device.enable} className="wv:font-medium wv:text-[white] wv:select-none">
                Deseja excluir esse dispositivo?
              </p>
            </div>
            <div className="wv:flex wv:flex-row wv:gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Submit"
                className="wv:bg-[transparent] wv:p-2 wv:px-[35px] wv:text-[white] wv:cursor-pointer wv:select-none"
                onClick={() => {
                  removeDevice(device.token);
                }}
              >
                Excluir
              </Button>
              <Button
                variant="outline"
                className="wv:bg-[transparent] wv:p-2 wv:px-[10px] wv:text-[white] wv:cursor-pointer wv:select-none"
                onClick={() => {
                  setConfirmDelete(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
