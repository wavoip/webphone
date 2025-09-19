import type { CallActive, CallOffer, CallOutgoing, Device, MultimediaError, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useDraggable } from "@/providers/DraggableProvider";
import { useScreen } from "@/providers/ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  devices: (Device & { enable: boolean })[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  multimediaError?: MultimediaError;
  makeCall: (to: string) => Promise<{
    err: {
      message: string;
      devices: {
        token: string;
        reason: string;
      }[];
    } | null;
  }>;
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

const pictureInPicture = {
  video: document.createElement("video"),
  canvas: document.createElement("canvas"),
};

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

  const [multimediaError, setMultimediaError] = useState<MultimediaError | undefined>(undefined);

  function onCallAccept(call: CallActive) {
    call.onEnd(() => onCallEnd());

    const callIntegrated: CallActive = {
      ...call,
      peer: call.peer.split("@")[0],
      onEnd: (cb) => {
        call.onEnd(() => {
          onCallEnd();
          cb();
        });
      },
    };

    setScreen("call");
    setCallActive(callIntegrated);

    return callIntegrated;
  }

  function onCallEnd() {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handlePictureInPicture);
    setTimeout(() => {
      setScreen("keyboard");
      setCallOutgoing(undefined);
    }, 3000);
  }

  async function makeCall(to: string) {
    const { call, err } = await wavoipInstance.startCall({
      fromTokens: devices.filter((device) => device.enable).map((device) => device.token),
      to,
    });

    if (err) {
      return { err };
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handlePictureInPicture);

    call.onPeerAccept((activeCall) => {
      onCallAccept(activeCall);
      setCallOutgoing(undefined);
    });

    call.onEnd(() => onCallEnd());

    const callOutgoinIntegrated: CallOutgoing = {
      ...call,
      peer: call.peer.split("@")[0],
      onPeerAccept: (cb) => {
        call.onPeerAccept((activeCall) => {
          const callIntegrated = onCallAccept(activeCall);
          setCallOutgoing(undefined);
          cb(callIntegrated);
        });
      },
      onEnd: (cb) => {
        call.onEnd(() => {
          cb();
          onCallEnd();
        });
      },
    };

    setCallOutgoing(callOutgoinIntegrated);
    setScreen("outgoing");

    return { err: null };
  }

  wavoipInstance.onMultimediaError((err) => {
    setMultimediaError(err);
  });

  wavoipInstance.onOffer((offer) => {
    if (callActive) {
      return;
    }

    offer.onEnd(() => setOffers((prev) => prev.filter(({ id }) => id !== offer.id)));

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

          window.addEventListener("beforeunload", handleBeforeUnload);
          document.addEventListener("visibilitychange", handlePictureInPicture);

          setOffers([]);
          const callIntegrated = onCallAccept(call);

          return { call: callIntegrated, err };
        }),
    };

    setOffers((prev) => [...prev, offerIntegrated]);
    open();
  });

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

  useEffect(() => {
    wavoipInstance.requestMicrophonePermission();
  }, [wavoipInstance.requestMicrophonePermission]);

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

export function handleMultimediaError(err: MultimediaError) {
  if (err.type === "audio") {
    if (err.reason === "NotAllowedError") {
      return "Permissão do alto falante foi negada";
    }
  }

  if (err.type === "microphone") {
    if (err.reason === "NotAllowedError") {
      return "Permissão do microfone foi negada";
    }
    if (err.reason === "OverconstrainedError") {
      return "Microfone não suporta os requisitos de áudio";
    }
    if (err.reason === "SecurityError") {
      return "Não é possível acessar o microfone, a página é insegura";
    }
    if (err.reason === "NotReadableError") {
      return "Não foi possível acessar o microfone";
    }
    if (err.reason === "NotFoundError") {
      return "Nenhum microfone encontrado";
    }
    if (err.reason === "AbortError") {
      return "O hardware do microfone não pode ser inicializado";
    }
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
}

async function handlePictureInPicture() {
  if (!document.pictureInPictureEnabled) return;

  if (document.hidden && !document.pictureInPictureElement) {
    const { canvas, video } = pictureInPicture;

    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.fillText("📞 On Call", 50, 50);
    }

    const stream = canvas.captureStream();

    video.srcObject = stream;
    video.muted = true;
    video.play();

    await video.requestPictureInPicture();
    return;
  }

  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
  }
}
