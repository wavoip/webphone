import type { CallActive, CallOffer, CallOutgoing, Device, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDraggable } from "@/providers/DraggableProvider";
import { useScreen } from "@/providers/ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  devices: (Device & { enable: boolean })[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  makeCall: (to: string) => Promise<void>;
  addDevice: (token: string) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);
export const localStorageKey = "wavoip:tokens";

interface WavoipProviderProps {
  children: ReactNode;
  wavoipInstance: Wavoip;
  deviceSettings: Map<string, { token: string; enable: boolean }>;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children, wavoipInstance, deviceSettings }) => {
  const { setScreen } = useScreen();
  const { open } = useDraggable();

  const [devices, setDevices] = useState<(Device & { enable: boolean })[]>(() =>
    wavoipInstance.getDevices().map((device) => ({
      ...device,
      enable: !!deviceSettings.get(device.token)?.enable || ["open", "CONNECTED"].includes(device.status as string),
    })),
  );

  const [offers, setOffers] = useState<CallOffer[]>([]);
  const [callOutgoing, setCallOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [callActive, setCallActive] = useState<CallActive | undefined>(undefined);

  async function makeCall(to: string) {
    const { call, err } = await wavoipInstance.startCall({
      fromTokens: devices.filter((device) => device.enable).map((device) => device.token),
      to,
    });

    if (err) {
      return;
    }

    call.onPeerAccept((activeCall) => {
      const callIntegrated: CallActive = {
        ...activeCall,
        peer: activeCall.peer.split("@")[0],
        onEnd: (cb) => {
          call.onEnd(() => {
            cb();
            setTimeout(() => {
              setCallActive(undefined);
              setScreen("keyboard");
            }, 3000);
          });
        },
      };

      setScreen("call");
      setCallActive(callIntegrated);
      setCallOutgoing(undefined);
    });

    call.onEnd(() => {
      setTimeout(() => {
        setScreen("keyboard");
        setCallOutgoing(undefined);
      }, 3000);
    });

    const callOutgoinIntegrated: CallOutgoing = {
      ...call,
      peer: call.peer.split("@")[0],
      onPeerAccept: (cb) => {
        call.onPeerAccept((activeCall) => {
          const callIntegrated: CallActive = {
            ...activeCall,
            peer: activeCall.peer.split("@")[0],
            onEnd: (cb) => {
              call.onEnd(() => {
                cb();
                setTimeout(() => {
                  setCallActive(undefined);
                  setScreen("keyboard");
                }, 3000);
              });
            },
          };

          setScreen("call");
          setCallActive(callIntegrated);
          setCallOutgoing(undefined);
          cb(callIntegrated);
        });
      },
      onEnd: (cb) => {
        call.onEnd(() => {
          cb();
          setTimeout(() => {
            setScreen("keyboard");
            setCallOutgoing(undefined);
          }, 3000);
        });
      },
    };

    setCallOutgoing(callOutgoinIntegrated);
    setScreen("outgoing");
  }

  function addDevice(token: string) {
    const [device] = wavoipInstance.addDevices([token]);
    setDevices((prev) => [...prev, { ...device, enable: ["open", "CONNECTED"].includes(device.status as string) }]);
  }

  function removeDevice(token: string) {
    wavoipInstance.removeDevices([token]);
    setDevices((prev) => prev.filter((device) => device.token !== token));
  }

  function enableDevice(token: string) {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: true } : device)));
  }

  function disableDevice(token: string) {
    setDevices((prev) => prev.map((device) => (device.token === token ? { ...device, enable: false } : device)));
  }

  wavoipInstance.onOffer((offer) => {
    if (callActive) {
      return;
    }

    offer.onEnd(() => {
      setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
    });

    const offerIntegrated: CallOffer = {
      ...offer,
      peer: offer.peer.split("@")[0],
      onEnd: (cb) => {
        offer.onEnd(() => {
          cb();
          setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
        });
      },
      accept: () =>
        offer.accept().then(({ call, err }) => {
          if (!call) {
            return { call, err };
          }

          call.onEnd(() => {
            setTimeout(() => {
              setCallActive(undefined);
              setScreen("keyboard");
            });
          });

          const callIntegrated: CallActive = {
            ...call,
            peer: call.peer.split("@")[0],
            onEnd: (cb) => {
              call.onEnd(() => {
                cb();
                setTimeout(() => {
                  setCallActive(undefined);
                  setScreen("keyboard");
                }, 3000);
              });
            },
          };

          setCallActive(callIntegrated);
          setScreen("call");
          setOffers([]);

          return { call: callIntegrated, err };
        }),
    };

    setOffers((prev) => [...prev, offerIntegrated]);
    open();
  });

  wavoipInstance.onMultimediaError((err) => {
    if (err.type === "audio") {
      if (err.reason === "NotAllowedError") {
        toast.error("Permissão do alto falante foi negada");
      }
    }

    if (err.type === "microphone") {
      if (err.reason === "NotAllowedError") {
        toast.error("Permissão do microfone foi negada");
      }
      if (err.reason === "OverconstrainedError") {
        toast.error("Microfone não suporta os requisitos de áudio");
      }
      if (err.reason === "SecurityError") {
        toast.error("Não é possível acessar o microfone, a página é insegura");
      }
      if (err.reason === "NotReadableError") {
        toast.error("Não foi possível acessar o microfone");
      }
      if (err.reason === "NotFoundError") {
        toast.error("Nenhum microfone encontrado");
      }
      if (err.reason === "AbortError") {
        toast.error("O hardware do microfone não pode ser inicializado");
      }
    }

    toast.error(err.reason);
  });

  useEffect(() => {
    let tokensMemory = "";

    for (const device of devices) {
      tokensMemory += `${tokensMemory ? ";" : ""}${device.token}:${device.enable}`;
      device.onQRCode((qrcode) => {
        setDevices((prev) => prev.map((d) => (d.token === device.token ? { ...device, qrcode } : d)));
      });
      device.onStatus((status) => {
        setDevices((prev) =>
          prev.map((d) =>
            d.token === device.token
              ? { ...device, status, enable: ["open", "CONNECTED"].includes(status as string) }
              : d,
          ),
        );
      });
    }

    localStorage.setItem(localStorageKey, tokensMemory);
    localStorage.getItem(localStorageKey);
  }, [devices]);

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
        devices,
        offers,
        callOutgoing,
        callActive,
        makeCall,
        addDevice,
        removeDevice,
        enableDevice,
        disableDevice,
      }}
    >
      {children}
    </WavoipContext.Provider>
  );
};

export const useWavoip = () => {
  const context = useContext(WavoipContext);
  if (!context) {
    throw new Error("useWavoip deve ser usado dentro de WavoipProvider");
  }
  return context;
};
