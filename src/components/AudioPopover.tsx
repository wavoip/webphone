import { CaretUpIcon, MicrophoneIcon, MicrophoneSlashIcon, SpeakerHighIcon, SpeakerLowIcon, SpeakerNoneIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useWavoip } from "@/providers/WavoipProvider";

// ─── Module-level mic singleton ───────────────────────────────────────────────
// AudioContext and RAF loop live at module scope — never touched by React or
// Radix lifecycle, so popover open/close has zero effect on the animation.

let _ctx: AudioContext | null = null;
let _analyser: AnalyserNode | null = null;
let _data: Uint8Array | null = null;
const _listeners = new Set<(level: number) => void>();
let _rafId = 0;
let _smoothed = 0;
let _stream: MediaStream | null = null;
let _source: MediaStreamAudioSourceNode | null = null;
let _deviceId: string | null = null;
let _connectPending = false;

function _ensureCtx(): AudioContext {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new AudioContext();
    const analyser = _ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0;
    _analyser = analyser;
    _data = new Uint8Array(analyser.frequencyBinCount);
    const osc = _ctx.createOscillator();
    const muteGain = _ctx.createGain();
    muteGain.gain.value = 0;
    osc.connect(muteGain);
    muteGain.connect(_ctx.destination);
    osc.start();
    _ctx.onstatechange = () => {
      if (_ctx && _ctx.state === "suspended") _ctx.resume().catch(() => {});
    };
  }
  return _ctx;
}

function _startLoop() {
  if (_rafId) return;
  function tick() {
    if (_analyser && _data) {
      _analyser.getByteTimeDomainData(_data);
      let sum = 0;
      for (let i = 0; i < _data.length; i++) {
        const v = (_data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.min(1, Math.sqrt(sum / _data.length) * 16);
      _smoothed = rms > _smoothed ? rms : _smoothed * 0.82;
    }
    _listeners.forEach((cb) => cb(_smoothed));
    _rafId = _listeners.size > 0 ? requestAnimationFrame(tick) : 0;
  }
  _rafId = requestAnimationFrame(tick);
}

async function _connectDevice(deviceId: string) {
  if (_connectPending) return;
  _connectPending = true;
  try {
    _source?.disconnect();
    _stream?.getTracks().forEach((t) => t.stop());
    _source = null;
    _stream = null;
    const ctx = _ensureCtx();
    await ctx.resume().catch(() => {});
    const constraint: MediaStreamConstraints["audio"] =
      deviceId && deviceId !== "default" ? { deviceId: { exact: deviceId } } : true;
    const s = await navigator.mediaDevices
      .getUserMedia({ audio: constraint })
      .catch(() => navigator.mediaDevices.getUserMedia({ audio: true }));
    _stream = s;
    _source = ctx.createMediaStreamSource(_stream);
    _source.connect(_analyser!);
    _deviceId = deviceId;
  } catch {
    // mic permission denied or unavailable
  } finally {
    _connectPending = false;
  }
}

function _subscribe(deviceId: string, listener: (level: number) => void): () => void {
  _ensureCtx();
  if (deviceId !== _deviceId && !_connectPending) {
    _connectDevice(deviceId);
  }
  _listeners.add(listener);
  _startLoop();
  return () => {
    _listeners.delete(listener);
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface AudioPopoverProps {
  kind: "audiooutput" | "audioinput";
}

function MicLevelMeter({ level, muted }: { level: number; muted: boolean }) {
  const bars = 12;
  const displayLevel = muted ? 0 : level;
  const percent = Math.round(displayLevel * 100);

  return (
    <div className="wv:flex wv:flex-col wv:gap-1">
      <div className="wv:flex wv:items-center wv:justify-between">
        <span className="wv:text-xs wv:text-muted-foreground">Teste do microfone</span>
        <span className="wv:text-xs wv:font-medium wv:tabular-nums wv:text-muted-foreground">{percent}%</span>
      </div>
      <div className="wv:flex wv:gap-0.5 wv:items-end wv:h-5">
        {Array.from({ length: bars }).map((_, i) => {
          const threshold = (i + 1) / bars;
          const active = displayLevel >= threshold;
          const color =
            i < bars * 0.6 ? "wv:bg-green-500" : i < bars * 0.85 ? "wv:bg-yellow-400" : "wv:bg-red-500";
          return (
            <div
              key={i}
              className={`wv:flex-1 wv:rounded-sm wv:transition-all wv:duration-75 ${active ? color : "wv:bg-muted"}`}
              style={{ height: `${50 + (i / bars) * 50}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function useMicLevel(deviceId: string): number {
  const [level, setLevel] = useState(0);
  useEffect(() => _subscribe(deviceId, setLevel), [deviceId]);
  return level;
}

interface AudioPopoverContentProps extends AudioPopoverProps {
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  micLevel?: number;
  selectedDeviceId?: string;
  onSelectedDeviceIdChange?: (id: string) => void;
}

function AudioPopoverContent({
  kind,
  muted = false,
  onMutedChange,
  volume = 80,
  onVolumeChange,
  micLevel = 0,
  selectedDeviceId: selectedDeviceIdProp,
  onSelectedDeviceIdChange,
}: AudioPopoverContentProps) {
  const storageKey = kind === "audiooutput" ? "wavoip:speaker_device_id" : "wavoip:mic_device_id";
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceIdInternal, setSelectedDeviceIdInternal] = usePersistedState<string>(storageKey, "default");
  const { wavoip } = useWavoip();

  const selectedDeviceId = selectedDeviceIdProp ?? selectedDeviceIdInternal;
  const setSelectedDeviceId = onSelectedDeviceIdChange ?? setSelectedDeviceIdInternal;
  const isOutput = kind === "audiooutput";

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
        const all = await navigator.mediaDevices.enumerateDevices();
        setDevices(
          all
            .filter((d) => d.kind === kind)
            .map((d) => ({ deviceId: d.deviceId, label: d.label || `Dispositivo ${d.deviceId.slice(0, 6)}` })),
        );
      } catch {}
    }
    loadDevices();
  }, [kind]);

  return (
    <PopoverContent side="bottom" align="end" className="wv:w-64 wv:p-4 wv:flex wv:flex-col wv:gap-4">
      <div className="wv:flex wv:flex-col wv:gap-2">
        <div className="wv:flex wv:items-center wv:gap-2 wv:text-foreground">
          {isOutput ? (
            volume === 0 ? (
              <SpeakerNoneIcon className="wv:size-4 wv:shrink-0 wv:text-red-500" weight="fill" />
            ) : volume < 10 ? (
              <SpeakerLowIcon className="wv:size-4 wv:shrink-0 wv:text-orange-400" weight="fill" />
            ) : (
              <SpeakerHighIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
            )
          ) : muted || volume === 0 ? (
            <MicrophoneSlashIcon className="wv:size-4 wv:shrink-0 wv:text-red-500" weight="fill" />
          ) : volume < 10 ? (
            <MicrophoneIcon className="wv:size-4 wv:shrink-0 wv:text-orange-400" weight="fill" />
          ) : (
            <MicrophoneIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
          )}
          <span
            className={`wv:text-xs wv:font-medium ${volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "wv:text-foreground"}`}
          >
            {isOutput ? "Volume" : "Ganho do microfone"}
          </span>
          {!isOutput && (
            <button
              onClick={() => onMutedChange?.(!muted)}
              className={`wv:ml-auto wv:flex wv:items-center wv:gap-1 wv:rounded wv:px-1.5 wv:py-0.5 wv:text-[10px] wv:font-medium wv:transition-colors wv:cursor-pointer wv:border-0 ${muted ? "wv:bg-red-100 wv:text-red-600" : "wv:bg-muted wv:text-muted-foreground wv:hover:bg-red-100 wv:hover:text-red-500"}`}
            >
              {muted ? "Mutado" : "Mutar"}
            </button>
          )}
          {isOutput && (
            <span
              className={`wv:ml-auto wv:text-xs wv:font-medium ${volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "wv:text-muted-foreground"}`}
            >
              {volume}%
            </span>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => {
            onMutedChange?.(false);
            onVolumeChange?.(Number(e.target.value));
          }}
          disabled={muted}
          className="wv:w-full wv:accent-blue-500 wv:cursor-pointer wv:disabled:opacity-40 wv:disabled:cursor-not-allowed"
        />
        {!isOutput && <MicLevelMeter level={micLevel} muted={muted} />}
      </div>

      {devices.length > 0 && (
        <div className="wv:flex wv:flex-col wv:gap-2">
          <div className="wv:border-t wv:border-border" />
          <span className="wv:text-xs wv:font-medium wv:text-foreground">
            {isOutput ? "Saída de áudio" : "Entrada de áudio"}
          </span>
          <select
            value={selectedDeviceId}
            onChange={(e) => {
              const deviceId = e.target.value;
              setSelectedDeviceId(deviceId);
              try {
                if (isOutput) wavoip.setAudioOutputDevice(deviceId);
                else wavoip.setAudioInputDevice(deviceId);
              } catch (err) {
                console.error("[AudioPopover] Failed to switch audio device:", err);
              }
            }}
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

const iconClass = "wv:size-4 wv:max-sm:size-6 wv:desktop:size-4 wv:pointer-events-none wv:text-[#66666c]";

function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  return [value, set] as const;
}

export function AudioOutputPopover() {
  const [volume, setVolume] = usePersistedState("wavoip:speaker-volume", 80);

  const SpeakerIcon = volume === 0 ? SpeakerNoneIcon : volume < 10 ? SpeakerLowIcon : SpeakerHighIcon;
  const speakerColor = volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "";

  return (
    <Popover>
      <PopoverTrigger type="button" className={triggerClass}>
        <SpeakerIcon className={`${iconClass} ${speakerColor}`} weight="fill" />
      </PopoverTrigger>
      <AudioPopoverContent kind="audiooutput" volume={volume} onVolumeChange={setVolume} />
    </Popover>
  );
}

// Directly mutates bar DOM elements on each audio frame — bypasses React's render
// cycle to avoid the compositing-layer freeze that occurred when Radix UI changed
// PopoverTrigger state (data-state/aria-expanded attributes).
function MicWaveBars({ deviceId }: { deviceId: string }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const maxHeights = [0.8, 1.0, 0.8];
    const base = 0.35;

    function onLevel(level: number) {
      barsRef.current.forEach((el, i) => {
        if (!el) return;
        const h = base + level * (maxHeights[i] - base);
        const clip = (1 - h) * 50;
        el.style.clipPath = `inset(${clip}% 0 ${clip}% 0 round 1.5px)`;
      });
    }

    return _subscribe(deviceId, onLevel);
  }, [deviceId]);

  const initialClip = `inset(${(1 - 0.35) * 50}% 0 ${(1 - 0.35) * 50}% 0 round 1.5px)`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "12px", width: "13px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          style={{
            width: "3px",
            height: "12px",
            backgroundColor: "#3b82f6",
            clipPath: initialClip,
          }}
        />
      ))}
    </div>
  );
}

export function AudioMiniPopover({ kind, className }: { kind: "audiooutput" | "audioinput"; className?: string }) {
  const isOutput = kind === "audiooutput";
  const [volume, setVolume] = usePersistedState<number>(isOutput ? "wavoip:speaker-volume" : "wavoip:mic-volume", 80);
  const [muted, setMuted] = usePersistedState<boolean>("wavoip:mic-muted", false);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = usePersistedState<string>(
    isOutput ? "wavoip:speaker_device_id" : "wavoip:mic_device_id",
    "default",
  );
  const { wavoip } = useWavoip();
  const shadowRoot = useShadowRoot();

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
        const all = await navigator.mediaDevices.enumerateDevices();
        setDevices(
          all
            .filter((d) => d.kind === kind)
            .map((d) => ({ deviceId: d.deviceId, label: d.label || `Dispositivo ${d.deviceId.slice(0, 6)}` })),
        );
      } catch {}
    }
    loadDevices();
  }, [kind]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`wv:flex wv:items-center wv:justify-center wv:size-[20px] wv:rounded-full wv:bg-muted wv:hover:bg-muted-foreground/30 wv:cursor-pointer wv:border wv:border-border wv:text-foreground/50 wv:transition-colors wv:shadow-sm ${className ?? ""}`}
        >
          {isOutput ? <CaretUpIcon size={9} weight="bold" /> : <MicWaveBars deviceId={selectedDeviceId} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        container={shadowRoot}
        side="top"
        align="center"
        className="wv:w-64 wv:p-4 wv:flex wv:flex-col wv:gap-4"
      >
        <div className="wv:flex wv:flex-col wv:gap-2">
          <div className="wv:flex wv:items-center wv:gap-2 wv:text-foreground">
            {isOutput ? (
              volume === 0 ? (
                <SpeakerNoneIcon className="wv:size-4 wv:shrink-0 wv:text-red-500" weight="fill" />
              ) : volume < 10 ? (
                <SpeakerLowIcon className="wv:size-4 wv:shrink-0 wv:text-orange-400" weight="fill" />
              ) : (
                <SpeakerHighIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
              )
            ) : muted || volume === 0 ? (
              <MicrophoneSlashIcon className="wv:size-4 wv:shrink-0 wv:text-red-500" weight="fill" />
            ) : (
              <MicrophoneIcon className="wv:size-4 wv:shrink-0 wv:text-foreground" weight="fill" />
            )}
            <span
              className={`wv:text-xs wv:font-medium ${volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "wv:text-foreground"}`}
            >
              {isOutput ? "Volume" : "Ganho do microfone"}
            </span>
            {!isOutput && (
              <button
                onClick={() => setMuted(!muted)}
                className={`wv:ml-auto wv:flex wv:items-center wv:gap-1 wv:rounded wv:px-1.5 wv:py-0.5 wv:text-[10px] wv:font-medium wv:transition-colors wv:cursor-pointer wv:border-0 ${muted ? "wv:bg-red-100 wv:text-red-600" : "wv:bg-muted wv:text-muted-foreground wv:hover:bg-red-100 wv:hover:text-red-500"}`}
              >
                {muted ? "Mutado" : "Mutar"}
              </button>
            )}
            {isOutput && (
              <span
                className={`wv:ml-auto wv:text-xs wv:font-medium ${volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "wv:text-muted-foreground"}`}
              >
                {volume}%
              </span>
            )}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setMuted(false);
              setVolume(Number(e.target.value));
            }}
            disabled={muted}
            className="wv:w-full wv:accent-blue-500 wv:cursor-pointer wv:disabled:opacity-40 wv:disabled:cursor-not-allowed"
          />
        </div>
        {devices.length > 0 && (
          <div className="wv:flex wv:flex-col wv:gap-2">
            <div className="wv:border-t wv:border-border" />
            <span className="wv:text-xs wv:font-medium wv:text-foreground">
              {isOutput ? "Saída de áudio" : "Entrada de áudio"}
            </span>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                const deviceId = e.target.value;
                setSelectedDeviceId(deviceId);
                try {
                  if (isOutput) wavoip.setAudioOutputDevice(deviceId);
                  else wavoip.setAudioInputDevice(deviceId);
                } catch (err) {
                  console.error("[AudioMiniPopover] Failed to switch audio device:", err);
                }
              }}
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
    </Popover>
  );
}

export function AudioInputPopover() {
  const [muted, setMuted] = usePersistedState("wavoip:mic-muted", false);
  const [volume, setVolume] = usePersistedState("wavoip:mic-volume", 80);
  const [selectedDeviceId, setSelectedDeviceId] = usePersistedState<string>("wavoip:mic_device_id", "default");

  const micLevel = useMicLevel(selectedDeviceId);

  const micColor = muted || volume === 0 ? "wv:text-red-500" : volume < 10 ? "wv:text-orange-400" : "";

  return (
    <Popover>
      <PopoverTrigger type="button" className={triggerClass}>
        {muted || volume === 0 ? (
          <MicrophoneSlashIcon className={`${iconClass} ${micColor}`} weight="fill" />
        ) : (
          <MicrophoneIcon className={`${iconClass} ${micColor}`} weight="fill" />
        )}
      </PopoverTrigger>
      <AudioPopoverContent
        kind="audioinput"
        muted={muted}
        onMutedChange={setMuted}
        volume={volume}
        onVolumeChange={setVolume}
        micLevel={micLevel}
        selectedDeviceId={selectedDeviceId}
        onSelectedDeviceIdChange={setSelectedDeviceId}
      />
    </Popover>
  );
}
