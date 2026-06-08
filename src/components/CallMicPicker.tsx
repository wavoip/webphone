import { CaretDownIcon, MicrophoneIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";
import { useAudioState, useMiddleware } from "@/middleware/react/hooks";

/**
 * In-call mic source switcher. Renders next to the call status row so the
 * user can swap microphones live without dropping the call.
 *
 * Idempotent: picking the currently active mic just closes the popover — no
 * setMicrophone round-trip. The component only renders interactive controls
 * when the SDK reports `micPermission === "granted"`.
 */
export function CallMicPicker() {
  const middleware = useMiddleware();
  const { micPermission, selectedMicId, availableAudio } = useAudioState();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const granted = micPermission === "granted";
  const mics = availableAudio.mics.filter((m) => m.deviceId);
  const selectedLabel = mics.find((m) => m.deviceId === selectedMicId)?.label ?? t("Default microphone");

  const onPick = async (deviceId: string) => {
    if (deviceId === selectedMicId) {
      setOpen(false);
      return;
    }
    setPending(deviceId);
    const { err } = await middleware.controllers.audio.setMicrophone(deviceId);
    setPending(null);
    if (err) {
      toast.error(t("Failed to switch microphone"), { description: err });
      return;
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={granted ? setOpen : undefined}>
      <PopoverTrigger
        disabled={!granted}
        className="wv:flex wv:items-center wv:gap-1 wv:text-foreground/70 wv:text-[12px] wv:hover:text-foreground wv:hover:cursor-pointer wv:disabled:cursor-not-allowed wv:disabled:opacity-50 wv:max-w-full wv:truncate"
      >
        <MicrophoneIcon size={14} />
        <span className="wv:truncate wv:max-w-[180px]">{selectedLabel}</span>
        <CaretDownIcon size={12} />
      </PopoverTrigger>
      <PopoverContent className="wv:w-[260px] wv:p-1">
        <ul className="wv:flex wv:flex-col">
          {mics.map((mic) => {
            const active = mic.deviceId === selectedMicId;
            const isPending = pending === mic.deviceId;
            return (
              <li key={mic.deviceId}>
                <button
                  type="button"
                  className={
                    "wv:w-full wv:text-left wv:px-2 wv:py-1.5 wv:rounded wv:text-[13px] wv:hover:bg-muted wv:disabled:opacity-50 " +
                    (active ? "wv:font-semibold" : "")
                  }
                  onClick={() => onPick(mic.deviceId)}
                  disabled={isPending}
                >
                  {mic.label || mic.deviceId}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
