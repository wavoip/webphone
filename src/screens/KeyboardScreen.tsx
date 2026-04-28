import { BackspaceIcon, PhoneIcon, WarningCircleIcon } from "@phosphor-icons/react";
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
// kept for SOUND_URLS map — do not remove
import { AudioInputPopover, AudioOutputPopover } from "@/components/AudioPopover";
import { KeyboardInput } from "@/components/KeyboardInput";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpeakerVolume } from "@/lib/device-settings";
import { useNotificationManager } from "@/providers/NotificationsProvider";
import { useSelectedDevice } from "@/providers/SelectedDeviceProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useWavoip } from "@/providers/WavoipProvider";

const SOUND_URLS: Record<string, string> = {
  "1": SoundDTMF1, "2": SoundDTMF2, "3": SoundDTMF3,
  "4": SoundDTMF4, "5": SoundDTMF5, "6": SoundDTMF6,
  "7": SoundDTMF7, "8": SoundDTMF8, "9": SoundDTMF9,
  "*": SoundDTMFStar, "0": SoundDTMF0, "#": SoundDTMFHash,
  backspace: SoundBackspace,
};

let _audioCtx: AudioContext | null = null;
const _buffers = new Map<string, AudioBuffer>();

function getAudioCtx(): AudioContext {
  if (!_audioCtx || _audioCtx.state === "closed") _audioCtx = new AudioContext();
  return _audioCtx;
}

async function preloadSounds() {
  const ctx = getAudioCtx();
  await Promise.all(
    Object.entries(SOUND_URLS).map(async ([key, url]) => {
      if (_buffers.has(key)) return;
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      _buffers.set(key, await ctx.decodeAudioData(buf));
    })
  );
}

function playSound(key: string, volume = 0.25) {
  const ctx = getAudioCtx();
  const buffer = _buffers.get(key);
  if (!buffer) return;
  if (ctx.state === "suspended") ctx.resume();
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume * getSpeakerVolume();
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

const buttons = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQES" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

function getDeviceByToken(token: string | null, devices: ReturnType<typeof useWavoip>["devices"]) {
  return token ? devices.find((d) => d.token === token) : devices.find((d) => d.enable);
}

const DDD_STATE: Record<string, string> = {
  "11": "São Paulo", "12": "São Paulo", "13": "São Paulo", "14": "São Paulo",
  "15": "São Paulo", "16": "São Paulo", "17": "São Paulo", "18": "São Paulo", "19": "São Paulo",
  "21": "Rio de Janeiro", "22": "Rio de Janeiro", "24": "Rio de Janeiro",
  "27": "Espírito Santo", "28": "Espírito Santo",
  "31": "Minas Gerais", "32": "Minas Gerais", "33": "Minas Gerais", "34": "Minas Gerais",
  "35": "Minas Gerais", "37": "Minas Gerais", "38": "Minas Gerais",
  "41": "Paraná", "42": "Paraná", "43": "Paraná", "44": "Paraná", "45": "Paraná", "46": "Paraná",
  "47": "Santa Catarina", "48": "Santa Catarina", "49": "Santa Catarina",
  "51": "Rio Grande do Sul", "53": "Rio Grande do Sul", "54": "Rio Grande do Sul", "55": "Rio Grande do Sul",
  "61": "Distrito Federal", "62": "Goiás", "64": "Goiás",
  "63": "Tocantins", "65": "Mato Grosso", "66": "Mato Grosso",
  "67": "Mato Grosso do Sul", "68": "Acre", "69": "Rondônia",
  "71": "Bahia", "73": "Bahia", "74": "Bahia", "75": "Bahia", "77": "Bahia",
  "79": "Sergipe", "81": "Pernambuco", "87": "Pernambuco",
  "82": "Alagoas", "83": "Paraíba", "84": "Rio Grande do Norte",
  "85": "Ceará", "88": "Ceará", "86": "Piauí", "89": "Piauí",
  "91": "Pará", "93": "Pará", "94": "Pará",
  "92": "Amazonas", "97": "Amazonas",
  "95": "Roraima", "96": "Amapá", "98": "Maranhão", "99": "Maranhão",
};

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

function getLocationName(token: string | null, devices: ReturnType<typeof useWavoip>["devices"]): string | null {
  const device = getDeviceByToken(token, devices);
  if (!device) return null;
  const raw = device.contact?.official?.phone ?? device.contact?.unofficial?.phone ?? null;
  if (!raw) return null;
  try {
    const digits = raw.replace(/\D/g, "");
    const phone = parsePhoneNumber(`+${digits}`);
    if (phone.country === "BR") {
      const national = phone.nationalNumber.toString();
      const ddd = national.slice(0, 2);
      return DDD_STATE[ddd] ?? "Brasil";
    }
    return new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(phone.country ?? "") ?? null;
  } catch {
    return null;
  }
}

export default function KeyboardScreen() {
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [callIsLoading, setCallIsLoading] = useState(false);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [showCountry, setShowCountry] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const countryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backspaceStepRef = useRef(0);

  const { startCall, devices } = useWavoip();
  const { addNotification } = useNotificationManager();
  const { selectedToken } = useSelectedDevice();
  const { showAddDevices, setSettingsModalOpen } = useSettings();
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

  useEffect(() => { preloadSounds(); }, []);

  useEffect(() => {
    if (countryTimerRef.current) clearTimeout(countryTimerRef.current);
    setShowCountry(false);

    const code = getCountryCode(selectedToken, devices);
    setCountryCode(code);
    const name = selectedToken
      ? getLocationName(selectedToken, devices)
      : code ? new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(code) ?? null : null;
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

  const handleCall = async () => {
    setCallIsLoading(true);
    setError("");

    const { err } = await startCall(number, null);

    setCallIsLoading(false);

    if (err) {
      const message = err.devices[0]?.reason ?? err.message;
      setError(message);
      setTimeout(() => setError(""), 4000);

      addNotification({
        id: new Date(),
        type: "CALL_FAILED",
        detail: number,
        message,
        token: err.devices[0]?.token ?? "",
        isRead: false,
        isHidden: false,
        created_at: new Date(),
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        handleCall();
      }}
      className="wv:flex wv:flex-col wv:size-full wv:items-center wv:px-2 wv:overflow-hidden"
    >
      <div className="wv:flex-[0.3] wv:min-h-0" />

      <div className="wv:text-center wv:shrink-0">
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

        <div className="wv:h-4 wv:flex wv:items-center wv:justify-center">
          {error ? (
            <p className="wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center">
              <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-1" />
              {error}
            </p>
          ) : !hasDevices ? (
            showAddDevices ? (
              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="wv:group wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center wv:cursor-pointer wv:bg-transparent wv:border-0 wv:p-0"
              >
                <span className="wv:group-hover:underline">
                  <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-[5px]" />
                  Nenhum número de Whatsapp configurado
                </span>
              </button>
            ) : (
              <p className="wv:text-[10px] wv:font-light wv:text-red-400 wv:tracking-[.15em] wv:text-center">
                <WarningCircleIcon size={12} color="red" className="wv:inline wv:align-middle wv:mr-1" />
                Nenhum número de Whatsapp configurado
              </p>
            )
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
        </div>

      </div>

      <div className="wv:flex-[2] wv:min-h-0" />

      <div className="wv:flex wv:flex-col wv:gap-2 wv:shrink-0">
        <div className="wv:relative wv:flex wv:max-w-[300px] wv:w-full wv:gap-2">
          <div className="wv:absolute wv:-top-[28px] wv:right-2 wv:z-10 wv:flex wv:items-center wv:gap-1">
            <AudioInputPopover />
            <AudioOutputPopover />
          </div>
          <div className="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-2 wv:[&>*]:select-none wv:[&>*]:max-w-[72px] wv:[&>*]:max-h-[72px] wv:justify-items-center">
            {Object.entries(buttons).map(([key, { digit, letters }]) => (
              <Button
                key={`webphone-keyboard-${key}`}
                type="button"
                variant={"secondary"}
                className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:touch-manipulation wv:shadow-none wv:bg-muted wv:active:bg-[#909096] wv:transition-colors wv:duration-700"
                onClick={() => {
                  setNumber((prev) => prev + digit);
                  playSound(digit);
                }}
              >
                <p className="wv:text-[22px] wv:leading-6 wv:font-semibold">{digit}</p>
                {!!letters && (
                  <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em]">{letters}</p>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="wv:flex wv:max-w-[300px] wv:w-full">
          <div className="wv:grid wv:grid-cols-3 wv:grid-rows-1 wv:w-full wv:gap-2 wv:[direction:rtl] wv:[&>*]:select-none wv:[&>*]:max-w-[72px] wv:[&>*]:max-h-[72px] wv:justify-items-center wv:items-center">
            <Button
              type="button"
              variant={"secondary"}
              size={"icon"}
              className="wv:size-fit wv:p-1.5 wv:shadow-none wv:bg-transparent wv:border-0 wv:rounded-full wv:hover:bg-muted wv:hover:cursor-pointer wv:touch-manipulation wv:transition-colors wv:duration-200"
              onClick={() => {
                playSound("backspace");
                setNumber((prev) => prev.slice(0, -1));
              }}
              onPointerDown={() => {
                backspaceStepRef.current = 0;
                backspaceHoldRef.current = setTimeout(() => {
                  const tick = () => {
                    playSound("backspace", 0.15);
                    setNumber((prev) => prev.slice(0, -1));
                    backspaceStepRef.current += 1;
                    const delay = Math.max(50, 130 - backspaceStepRef.current * 8);
                    backspaceIntervalRef.current = setTimeout(tick, delay);
                  };
                  tick();
                }, 400);
              }}
              onPointerUp={() => {
                clearTimeout(backspaceHoldRef.current!);
                clearTimeout(backspaceIntervalRef.current!);
              }}
              onPointerLeave={() => {
                clearTimeout(backspaceHoldRef.current!);
                clearTimeout(backspaceIntervalRef.current!);
              }}
            >
              <BackspaceIcon className="wv:size-5 wv:max-sm:size-8 wv:desktop:size-5 wv:text-[#66666c]" weight="fill" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="wv:aspect-square wv:size-full wv:max-w-[72px] wv:max-h-[72px]">
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

      <div className="wv:flex-[1] wv:min-h-0" />
    </form>
  );
}
