import { BackspaceIcon, ExclamationMarkIcon, PhoneIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { parsePhoneNumber } from "libphonenumber-js";
import { useEffect, useRef, useState } from "react";
import SoundBackspace from "@/assets/sounds/backspace.mp3";
import SoundDTMF0 from "@/assets/sounds/dtmf-0.mp3";
import SoundDTMF1 from "@/assets/sounds/dtmf-1.mp3";
import SoundDTMF2 from "@/assets/sounds/dtmf-2.mp3";
import SoundDTMF3 from "@/assets/sounds/dtmf-3.mp3";
import SoundDTMF4 from "@/assets/sounds/dtmf-4.mp3";
import SoundDTMF5 from "@/assets/sounds/dtmf-5.mp3";
import SoundDTMF6 from "@/assets/sounds/dtmf-6.mp3";
import SoundDTMF7 from "@/assets/sounds/dtmf-7.mp3";
import SoundDTMF8 from "@/assets/sounds/dtmf-8.mp3";
import SoundDTMF9 from "@/assets/sounds/dtmf-9.mp3";
import SoundDTMFHash from "@/assets/sounds/dtmf-hash.mp3";
import SoundDTMFStar from "@/assets/sounds/dtmf-star.mp3";
import { AudioInputPopover, AudioOutputPopover } from "@/components/AudioPopover";
import { KeyboardInput } from "@/components/KeyboardInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotificationManager } from "@/providers/NotificationsProvider";
import { useSelectedDevice } from "@/providers/SelectedDeviceProvider";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useWavoip } from "@/providers/WavoipProvider";

const buttons = [
  {
    digit: "1",
    letters: "",
    audio: new Audio(SoundDTMF1),
  },
  {
    digit: "2",
    letters: "ABC",
    audio: new Audio(SoundDTMF2),
  },
  {
    digit: "3",
    letters: "DEF",
    audio: new Audio(SoundDTMF3),
  },
  {
    digit: "4",
    letters: "GHI",
    audio: new Audio(SoundDTMF4),
  },
  {
    digit: "5",
    letters: "JKL",
    audio: new Audio(SoundDTMF5),
  },
  {
    digit: "6",
    letters: "MNO",
    audio: new Audio(SoundDTMF6),
  },
  {
    digit: "7",
    letters: "PQES",
    audio: new Audio(SoundDTMF7),
  },
  {
    digit: "8",
    letters: "TUV",
    audio: new Audio(SoundDTMF8),
  },
  {
    digit: "9",
    letters: "WXYZ",
    audio: new Audio(SoundDTMF9),
  },
  {
    digit: "*",
    letters: "",
    audio: new Audio(SoundDTMFStar),
  },
  {
    digit: "0",
    letters: "+",
    audio: new Audio(SoundDTMF0),
  },
  {
    digit: "#",
    letters: "",
    audio: new Audio(SoundDTMFHash),
  },
];

const backspace_audio = new Audio(SoundBackspace);

function getDeviceByToken(token: string | null, devices: ReturnType<typeof useWavoip>["devices"]) {
  return token ? devices.find((d) => d.token === token) : devices.find((d) => d.enable);
}

function getCountryCode(token: string | null, devices: ReturnType<typeof useWavoip>["devices"]): string | null {
  const device = getDeviceByToken(token, devices);
  if (!device) return null;
  const raw = device.contact?.official?.phone ?? device.contact?.unofficial?.phone ?? null;
  if (!raw) return null;
  try {
    const phone = parsePhoneNumber(`+${raw.replace(/\D/g, "")}`);
    return phone.country ?? null;
  } catch {
    return null;
  }
}

function getCountryName(countryCode: string | null): string | null {
  if (!countryCode) return null;
  return new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(countryCode) ?? null;
}

export default function KeyboardScreen() {
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [callIsLoading, setCallIsLoading] = useState(false);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [showCountry, setShowCountry] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const countryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { startCall, devices } = useWavoip();
  const { addNotification } = useNotificationManager();
  const { selectedToken } = useSelectedDevice();
  const shadowRoot = useShadowRoot();

  const hasDevices = devices.some((d) => d.enable);
  const selectedDevice = selectedToken
    ? devices.find((d) => d.token === selectedToken)
    : devices.find((d) => d.enable);
  const isDeviceDisconnected = hasDevices && (selectedDevice ? selectedDevice.status !== "open" : false);

  const callDisabled = callIsLoading || isDeviceDisconnected || !hasDevices;
  const callTooltip = !hasDevices
    ? "Nenhum número de Whatsapp configurado"
    : isDeviceDisconnected
      ? "Seu número de Whatsapp está desconectado, conecte para continuar"
      : null;

  useEffect(() => {
    if (countryTimerRef.current) clearTimeout(countryTimerRef.current);
    setShowCountry(false);

    const code = getCountryCode(selectedToken, devices);
    setCountryCode(code);
    const name = getCountryName(code);
    if (!name) {
      setCountryName(null);
      return;
    }

    setCountryName(name);
    countryTimerRef.current = setTimeout(() => {
      setShowCountry(true);
    }, 250);

    return () => {
      if (countryTimerRef.current) clearTimeout(countryTimerRef.current);
    };
  }, [selectedToken, devices]);

  const handleCall = async (devices: string[]) => {
    const isLast = devices.length <= 1;
    const device = devices[0];

    setCallIsLoading(true);
    setError("");
    setStatus(`Ligando de ${device}`);

    await startCall(number, [device]).then(({ err }) => {
      if (!err) {
        setStatus("Ok");
        setCallIsLoading(false);
        return;
      }

      const error_message = err?.devices[0]?.reason ?? err.message;

      if (error_message === "Número não existe") {
        setError(error_message);
        setStatus("");
        setCallIsLoading(false);

        setTimeout(() => {
          setError("");
        }, 4000);

        return;
      }

      addNotification({
        id: new Date(),
        type: "CALL_FAILED",
        detail: `${device} -> ${number}`,
        message: error_message,
        token: device,
        isRead: false,
        isHidden: false,
        created_at: new Date(),
      });

      if (!isLast) {
        // setStatus(err.message);
        handleCall(devices.slice(1));
      } else {
        setStatus("Nenhum dispositivo está disponível");
        setCallIsLoading(false);

        setTimeout(() => {
          setStatus("");
        }, 3000);
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const tokens = devices.filter((device) => device.enable).map((device) => device.token);
        handleCall([...tokens]);
      }}
      className="wv:flex wv:flex-col wv:size-full wv:items-center wv:justify-around wv:desktop:justify-evenly wv:px-2 wv:pb-4"
    >
      <div className="">
        <div className="wv:text-center">
          {/* <Input
          placeholder="Digite..."
          value={number}
          onChange={(e) => {
            const digits = e.target.value.match(/[\d*#]+/g)?.[0] || "";
            setNumber(digits);
          }}
          className="wv:border-none wv:border-l-0 wv:border-r-0 wv:border-t-0 wv:shadow-none wv:rounded-none wv:!text-foreground wv:text-center wv:focus-visible:ring-0 wv:text-[24px]  wv:max-sm:text-[30px] wv:md:text-[24px] wv:!bg-[transparent]"
        /> */}
          <div className="wv:overflow-hidden">
            <KeyboardInput
              value={number}
              callIsLoading={callIsLoading}
              country={countryCode}
              onChange={(e: any) => {
                const digits = e.target.value.replace(/[^\d*#+]/g, "");
                setNumber(digits);
              }}
            />
          </div>

          {error ? (
            <p className="wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center">
              <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-1" />
              {error}
            </p>
          ) : !hasDevices ? (
            <p className="wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center">
              <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-1" />
              Nenhum número de Whatsapp configurado
            </p>
          ) : isDeviceDisconnected ? (
            <p className="wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center">
              <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-1" />
              Whatsapp desconectado
            </p>
          ) : showCountry && countryName ? (
            <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em] wv:animate-[fade-slide-up_0.6s_ease-out_forwards]">
              {countryName}
            </p>
          ) : null}

          {status && (
            <div className="wv:flex wv:flex-row wv:gap-2 wv:items-center wv:justify-center">
              {callIsLoading && (
                <div className="wv:flex">
                  <div className="wv:h-3 wv:w-3 wv:animate-spin wv:rounded-full wv:border-2 wv:border-[black] wv:border-t-transparent"></div>
                </div>
              )}
              <p className="wv:text-[10px] wv:font-light wv:text-[gray] wv:tracking-[.15em]">{status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="wv:flex wv:flex-col wv:gap-3">
        <div className="wv:relative wv:flex wv:max-w-[300px] wv:w-full wv:gap-3">
          <div className="wv:absolute wv:-top-[30px] wv:right-2 wv:z-10 wv:flex wv:items-center wv:gap-1">
            <AudioInputPopover />
            <AudioOutputPopover />
          </div>
          <div className="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-3 wv:[&>*]:select-none wv:[&>*]:max-w-[80px] wv:[&>*]:max-h-[80px] wv:justify-items-center">
            {Object.entries(buttons).map(([key, { digit, letters, audio }]) => (
              <Button
                key={`webphone-keyboard-${key}`}
                type="button"
                variant={"secondary"}
                className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:cursor-pointer wv:text-foreground wv:bg-muted wv:hover:bg-accent wv:active:bg-accent/90 wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:transition-colors wv:duration-500 wv:hover:duration-200 wv:touch-manipulation"
                onClick={() => {
                  setNumber((prev) => prev + digit);
                  audio.pause();
                  audio.currentTime = 0;
                  audio.volume = 0.25;
                  audio.play();
                }}
              >
                <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">{digit}</p>
                {!!letters && (
                  <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em]">{letters}</p>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="wv:flex wv:max-w-[300px] wv:w-full">
          <div className="wv:grid wv:grid-cols-3 wv:grid-rows-1 wv:w-full wv:gap-3 wv:[direction:rtl] wv:[&>*]:select-none wv:[&>*]:max-w-[80px] wv:[&>*]:max-h-[80px] wv:justify-items-center wv:items-center">
            <Button
              type="button"
              variant={"secondary"}
              size={"icon"}
              onClick={() => {
                backspace_audio.pause();
                backspace_audio.currentTime = 0;
                backspace_audio.play();

                setNumber((prev) => prev.slice(0, -1));
              }}
              className="wv:aspect-square wv:size-fit wv:p-2 wv:shadow-none wv:bg-[transparent] wv:hover:bg-[transparent] wv:hover:text-[green] vw:border-none wv:text-foreground wv:hover:cursor-pointer wv:h-[56px] wv:touch-manipulation"
            >
              <BackspaceIcon className="wv:size-5 wv:max-sm:size-8 wv:desktop:size-5" weight="fill" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="wv:aspect-square wv:size-full wv:max-w-[80px] wv:max-h-[80px]">
                  <Button
                    type="submit"
                    size={"icon"}
                    className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-green-700 wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
                    disabled={callDisabled}
                  >
                    <PhoneIcon className="wv:size-7" weight="fill" />
                  </Button>
                </span>
              </TooltipTrigger>
              {callTooltip && (
                <TooltipContent side="right" container={shadowRoot} className="wv:max-w-[180px] wv:text-center wv:[&_svg]:hidden wv:bg-surface wv:text-foreground">
                  {callTooltip}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>
    </form>
  );
}
