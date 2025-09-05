import React, { createContext, type ReactNode, useContext, useState } from "react";
import {
  type CallActive,
  type CallOffer,
  type CallOutgoing,
  type Device,
  type MultimediaError,
  Wavoip,
} from "wavoip-api";
import { useScreen } from "@/providers/ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  devices: (Device & { enable: boolean })[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  multimediaError?: MultimediaError;
  makeCall: (to: string) => Promise<void>;
  addDevice: (token: string) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  children: ReactNode;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children }) => {
  const { setScreen } = useScreen();

  const [wavoipInstance] = useState(() => new Wavoip({ tokens: ["d4a8d1c1-18f9-4ff5-8712-edfffa71a2a2"] }));

  const [devices, setDevices] = useState<(Device & { enable: boolean })[]>(() =>
    wavoipInstance.getDevices().map((device) => ({ ...device, enable: true })),
  );

  const [offers, setOffers] = useState<CallOffer[]>([]);
  // const [offers, setOffers] = useState<CallOffer[]>([
  //   {
  //     id: "teste",
  //     accept: () => new Promise<CallActive | null>((resolve) => resolve(null)),
  //     reject: () => new Promise<{ err: string | null }>((resolve) => resolve({ err: null })),
  //     device_token: "token foda",
  //     muted: false,
  //     direction: "INCOMING",
  //     peer: "PUTA",
  //     peerMuted: false,
  //     status: "RINGING",
  //     onAcceptedElsewhere: () => {},
  //     onEnd: () => {},
  //     onRejectedElsewhere: () => {},
  //     onUnanswered: () => {},
  //   },
  // ]);
  const [callOutgoing, setCallOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [callActive, setCallActive] = useState<CallActive | undefined>(undefined);
  const [multimediaError, setMultimediaError] = useState<MultimediaError | undefined>(undefined);

  async function makeCall(to: string) {
    const { call, err } = await wavoipInstance.startCall({ to });

    if (err) {
      console.error("Erro ao iniciar chamada:", err.message);
      return;
    }

    call.onPeerAccept((activeCall) => {
      console.log("Chamada aceita pelo peer:", activeCall);
      setScreen("call");
      setCallActive(activeCall);
    });

    call.onEnd(() => {
      console.log("Chamada encerrada");
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
          console.log("Chamada aceita pelo peer:", activeCall);
          cb(activeCall);
          setScreen("call");
          setCallActive(activeCall);
        });
      },
      onEnd: (cb) => {
        call.onEnd(() => {
          console.log("Chamada encerrada");
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
    // biome-ignore lint/style/noNonNullAssertion: Existe
    const device = wavoipInstance.addDevices([token]).find((device) => device.token === token)!;
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
    console.log("Nova oferta de chamada recebida:", offer);

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
        offer.accept().then((call) => {
          if (!call) {
            return call;
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
                });
              });
            },
          };

          setCallActive(callIntegrated);
          setScreen("call");
          setOffers([]);

          return callIntegrated;
        }),
    };

    setOffers((prev) => [...prev, offerIntegrated]);
  });

  wavoipInstance.onMultimediaError((err) => setMultimediaError(err));

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
        devices,
        offers,
        callOutgoing,
        callActive,
        multimediaError,
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
