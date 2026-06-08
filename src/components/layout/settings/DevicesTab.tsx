import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { DeviceInfo } from "@/components/layout/status-bar/DeviceInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  setShowQRCode: React.Dispatch<React.SetStateAction<string | null>>;
};

export function DevicesTab({ setShowQRCode }: Props) {
  const { addDevice, devices } = useWavoip();
  const middleware = useMiddleware();
  const { showAddDevice, showEnableDevice, showRemoveDevice } = useStore(
    middleware.store,
    useShallow((s) => ({
      showAddDevice: s.settings.showAddDevices,
      showEnableDevice: s.settings.showEnableDevices,
      showRemoveDevice: s.settings.showRemoveDevices,
    })),
  );

  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const devicesSorted = useMemo(() => devices.slice().sort((a, b) => Number(b.enable) - Number(a.enable)), [devices]);

  const onAdd = () => {
    if (!token.trim()) {
      setError(t("Enter the token"));
      return;
    }
    addDevice(token);
    setToken("");
  };

  return (
    <div className="wv:flex wv:flex-col wv:gap-4 wv:h-full wv:overflow-hidden">
      {showAddDevice && (
        <div className="wv:flex wv:items-center wv:gap-2">
          <Input
            placeholder={error ? error : "Token"}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (error) setError("");
            }}
            className={`wv:focus-visible:ring-0 wv:flex-1 ${error ? "wv:border-red-500" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
          />
          <Button
            type="button"
            onClick={onAdd}
            className="wv:bg-green-400 wv:size-fit wv:p-1.5 wv:h-9 wv:aspect-square wv:hover:cursor-pointer"
          >
            <PlusIcon />
          </Button>
        </div>
      )}

      <div className="wv:overflow-auto wv:flex wv:flex-col wv:gap-2 wv:flex-1">
        {devicesSorted.length === 0 && (
          <p className="wv:text-sm wv:text-foreground/60 wv:text-center wv:py-8">{t("No devices yet")}</p>
        )}
        {devicesSorted.map((device) => (
          <DeviceInfo
            key={device.token}
            settings={{ showEnable: showEnableDevice, showRemove: showRemoveDevice }}
            device={device}
            setShowQRCode={setShowQRCode}
          />
        ))}
      </div>
    </div>
  );
}
