import { HeadphonesIcon, MicrophoneIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface AudioPopoverProps {
  kind: "audiooutput" | "audioinput";
}

function AudioPopoverContent({ kind }: AudioPopoverProps) {
  const [volume, setVolume] = useState(80);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("default");

  const isOutput = kind === "audiooutput";

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => { });
        const all = await navigator.mediaDevices.enumerateDevices();
        const filtered = all
          .filter((d) => d.kind === kind)
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Dispositivo ${d.deviceId.slice(0, 6)}`,
          }));
        setDevices(filtered);
      } catch {
        // permissão negada ou API indisponível
      }
    }
    loadDevices();
  }, [kind]);

  return (
    <PopoverContent side="bottom" align="end" className="wv:w-64 wv:p-4 wv:flex wv:flex-col wv:gap-4">
      <div className="wv:flex wv:flex-col wv:gap-2">
        <div className="wv:flex wv:items-center wv:gap-2 wv:text-foreground">
          {isOutput
            ? <SpeakerHighIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
            : <MicrophoneIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
          }
          <span className="wv:text-xs wv:font-medium wv:text-foreground">
            {isOutput ? "Volume" : "Ganho do microfone"}
          </span>
          <span className="wv:ml-auto wv:text-xs wv:text-muted-foreground">{volume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="wv:w-full wv:accent-primary wv:cursor-pointer"
        />
      </div>

      {devices.length > 0 && (
        <div className="wv:flex wv:flex-col wv:gap-2">
          <span className="wv:text-xs wv:font-medium wv:text-foreground">
            {isOutput ? "Saída de áudio" : "Entrada de áudio"}
          </span>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="wv:w-full wv:rounded-md wv:border wv:border-input wv:bg-background wv:px-2 wv:py-1.5 wv:text-xs wv:text-foreground wv:outline-none wv:focus:ring-1 wv:focus:ring-ring wv:cursor-pointer"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </PopoverContent>
  );
}

const triggerClass =
  "wv:p-1 wv:max-sm:p-2 wv:desktop:p-1 wv:bg-transparent wv:border-0 wv:text-foreground wv:hover:bg-accent wv:active:bg-[#D9D9DD] wv:rounded-full wv:cursor-pointer wv:outline-none wv:touch-manipulation wv:transition-colors wv:duration-200";

const iconClass = "wv:size-4 wv:max-sm:size-6 wv:desktop:size-4 wv:pointer-events-none";

export function AudioOutputPopover() {
  return (
    <Popover>
      <PopoverTrigger type="button" className={triggerClass}>
        <HeadphonesIcon className={iconClass} weight="fill" />
      </PopoverTrigger>
      <AudioPopoverContent kind="audiooutput" />
    </Popover>
  );
}

export function AudioInputPopover() {
  return (
    <Popover>
      <PopoverTrigger type="button" className={triggerClass}>
        <MicrophoneIcon className={iconClass} weight="fill" />
      </PopoverTrigger>
      <AudioPopoverContent kind="audioinput" />
    </Popover>
  );
}
