import { Warning } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";

export function DevicesAlert() {
  const state = useStore();

  const disconnectedDevices = useMemo(
    () => devices.filter(({ connectionStatus }) => connectionStatus === "disconnected"),
    [devices],
  );
  const qrcodeDevices = useMemo(() => devices.filter(({ status }) => status === "connecting"), [devices]);
  const closedDevices = useMemo(() => devices.filter(({ status }) => status === "close"), [devices]);
  const hibernatedDevices = useMemo(() => devices.filter(({ status }) => status === "hibernating"), [devices]);
  const errorDevices = useMemo(
    () => devices.filter(({ status }) => status === "error" || status === "EXTERNAL_INTEGRATION_ERROR"),
    [devices],
  );

  const hasWarnings =
    disconnectedDevices.length && qrcodeDevices.length && closedDevices.length && hibernatedDevices.length;

  if (!hasWarnings) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Warning className="wv:size-6 wv:text-foreground" />
      </TooltipTrigger>
      <TooltipContent className="wv:flex wv:flex-col wv:items-center wv:gap-1">
        {!!disconnectedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start wv:justify-center">
            <p>{t("Disconnected devices")}</p>
            <div className="wv:flex wv:gap-1">
              {disconnectedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!qrcodeDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>{t("Devices waiting for QR code")}</p>
            <div className="wv:flex wv:gap-1">
              {qrcodeDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!closedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>{t("Closed devices")}</p>
            <div className="wv:flex wv:gap-1">
              {closedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!hibernatedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>{t("Hibernating devices")}</p>
            <div className="wv:flex wv:gap-1">
              {hibernatedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!errorDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>{t("Devices with errors")}</p>
            <div className="wv:flex wv:gap-1">
              {errorDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
