import { ArrowLeftIcon, DeviceMobileIcon, GearIcon } from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";
import { DeviceInfo } from "@/components/layout/status-bar/DeviceInfo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mergeToAPI } from "@/lib/webphone-api/api";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";

const _settingsModalHandlers = { setOpen: null as ((open: boolean) => void) | null };

export function openSettingsModal() {
  _settingsModalHandlers.setOpen?.(true);
}

export function SettingsModal() {
  const { wavoip, addDevice, devices } = useWavoip();
  const { root } = useShadowRoot();
  const { audio: audioMenuSettings, devices: devicesMenuSettings } = useSettings();

  const [showAudio] = useState(audioMenuSettings.show);
  const [showDevices, setShowDevices] = useState(devicesMenuSettings.show);
  const [showAddDevice, setShowAddDevice] = useState(devicesMenuSettings.showAdd);
  const [showEnableDevice, setShowEnableDevice] = useState(devicesMenuSettings.enableShow);
  const [showRemoveDevice, setShowRemoveDevice] = useState(devicesMenuSettings.removeShow);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [qrcode, setQrcode] = useState<null | string>(null);

  const devicesSorted = useMemo(
    () => [...devices].sort((a, b) => Number(b.enable) - Number(a.enable)),
    [devices],
  );

  useEffect(() => {
    _settingsModalHandlers.setOpen = setOpen;
    return () => {
      _settingsModalHandlers.setOpen = null;
    };
  }, []);

  useEffect(() => {
    mergeToAPI({
      settings: {
        showDevices,
        setShowDevices: (...args) => setShowDevices(...args),
        showAddDevices: showAddDevice,
        setShowAddDevices: (...args) => setShowAddDevice(...args),
        showEnableDevices: showEnableDevice,
        setShowEnableDevices: (...args) => setShowEnableDevice(...args),
        showRemoveDevices: showRemoveDevice,
        setShowRemoveDevices: (...args) => setShowRemoveDevice(...args),
      },
    });
  }, [showDevices, showAddDevice, showEnableDevice, showRemoveDevice]);

  useEffect(() => {
    if (wavoip && open) wavoip.getMultimediaDevices();
  }, [open, wavoip]);

  function handleAddDevice() {
    if (!token.trim()) {
      setError("Informe o token");
      return;
    }
    addDevice(token.trim());
    setToken("");
    setError("");
  }

  const connectedCount = devicesSorted.filter((d) => ["open", "UP"].includes(d.status)).length;

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(next) => {
        if (qrcode && !next) {
          setQrcode(null);
          return;
        }
        setOpen(next);
      }}
    >
      <DialogTrigger className="wv:hover:cursor-pointer wv:hover:bg-background wv:text-foreground wv:p-0.5 wv:rounded-full wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:max-sm:p-2 wv:desktop:p-1">
        <GearIcon className="wv:max-sm:size-6 wv:desktop:size-4 wv:pointer-events-none" />
      </DialogTrigger>

      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:h-1/2"
      >
        <DialogTitle className="wv:sr-only">Configurações</DialogTitle>
        <DialogDescription className="wv:sr-only">Configurações do webphone</DialogDescription>

        <div className="wv:flex wv:flex-col wv:flex-1 wv:overflow-hidden">
          {/* QR Code View */}
          {qrcode && (
            <div className="wv:flex wv:flex-col wv:h-full wv:gap-4">
              <div className="wv:flex wv:items-center wv:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="wv:size-7 wv:rounded-full wv:cursor-pointer wv:shrink-0"
                  onClick={() => setQrcode(null)}
                >
                  <ArrowLeftIcon className="wv:size-4 wv:pointer-events-none" />
                </Button>
                <div className="wv:min-w-0">
                  <p className="wv:text-sm wv:font-semibold wv:text-foreground wv:leading-tight">
                    Escanear QR Code
                  </p>
                  <p className="wv:text-[11px] wv:text-muted-foreground">
                    WhatsApp → Aparelhos conectados → Conectar aparelho
                  </p>
                </div>
              </div>
              <div className="wv:flex wv:flex-1 wv:items-center wv:justify-center wv:p-4">
                <QRCode value={qrcode} level="L" className="wv:w-full wv:h-full wv:max-h-44" />
              </div>
            </div>
          )}

          {/* Main View */}
          {!qrcode && (
            <Tabs
              defaultValue="devices"
              orientation="vertical"
              className="wv:flex wv:flex-col wv:flex-1 wv:overflow-hidden"
            >
              {showAudio && (
                <TabsList className="wv:self-start wv:mb-1">
                  {showDevices && <TabsTrigger value="devices">Números</TabsTrigger>}
                  <TabsTrigger value="audio" disabled>Áudio</TabsTrigger>
                </TabsList>
              )}

              {showDevices && (
                <TabsContent
                  value="devices"
                  className="wv:flex wv:flex-col wv:flex-1 wv:overflow-hidden wv:mt-0"
                >
                  <div className="wv:flex wv:flex-col wv:h-full wv:gap-3 wv:overflow-hidden">

                    {/* Section header */}
                    <div className="wv:flex wv:items-center wv:justify-between wv:pt-0.5">
                      <p className="wv:text-sm wv:font-semibold wv:text-foreground">Dispositivos</p>
                      {devicesSorted.length > 0 && (
                        <span className="wv:text-[11px] wv:text-muted-foreground">
                          {connectedCount}/{devicesSorted.length} conectado{connectedCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Add device input */}
                    {showAddDevice && (
                      <div className="wv:flex wv:gap-2 wv:items-center">
                        <Input
                          placeholder={error || "Cole o token aqui"}
                          value={token}
                          onChange={(e) => {
                            setToken(e.target.value);
                            if (error) setError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleAddDevice()}
                          className={`wv:focus-visible:ring-0 wv:flex-1 wv:h-8 wv:text-xs wv:placeholder:text-xs ${
                            error
                              ? "wv:border-red-400 wv:placeholder:text-red-400"
                              : ""
                          }`}
                        />
                        <Button
                          type="button"
                          onClick={handleAddDevice}
                          className="wv:h-8 wv:w-8 wv:p-0 wv:bg-green-500 wv:hover:bg-green-600 wv:cursor-pointer wv:shrink-0 wv:rounded-md"
                        >
                          <PlusIcon className="wv:size-4 wv:pointer-events-none" />
                        </Button>
                      </div>
                    )}

                    {/* Device list */}
                    <div className="wv:flex-1 wv:overflow-y-auto wv:flex wv:flex-col wv:gap-2 wv:pb-1 wv:pr-0.5">
                      {devicesSorted.length === 0 ? (
                        <div className="wv:flex wv:flex-col wv:items-center wv:justify-center wv:gap-2 wv:py-8 wv:text-center wv:flex-1">
                          <div className="wv:size-10 wv:rounded-full wv:bg-muted wv:flex wv:items-center wv:justify-center">
                            <DeviceMobileIcon className="wv:size-5 wv:text-muted-foreground wv:pointer-events-none" />
                          </div>
                          <div>
                            <p className="wv:text-sm wv:font-medium wv:text-foreground">
                              Nenhum dispositivo
                            </p>
                            <p className="wv:text-xs wv:text-muted-foreground wv:mt-0.5">
                              Adicione um token para realizar chamadas
                            </p>
                          </div>
                        </div>
                      ) : (
                        devicesSorted.map((device) => (
                          <DeviceInfo
                            key={device.token}
                            settings={{
                              showEnable: showEnableDevice,
                              showRemove: showRemoveDevice,
                            }}
                            device={device}
                            setShowQRCode={setQrcode}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {showAudio && (
                <TabsContent value="audio">
                  <AudioConfig />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
