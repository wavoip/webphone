import { useEffect, useRef } from "react";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

/**
 * O timer da próxima repetição é cancelado na recuperação, no fim e no unmount — senão
 * um timer agendado nos 3s de silêncio toca na chamada que já voltou ou já acabou.
 */
export function useReconnectingSound(callStatus: CallStatus, sound: HTMLAudioElement) {
  const replayRef = useRef<number | null>(null);

  useEffect(() => {
    const cancelReplay = () => {
      if (replayRef.current) {
        clearTimeout(replayRef.current);
        replayRef.current = null;
      }
    };

    const stop = () => {
      sound.onended = null;
      cancelReplay();
      sound.pause();
      sound.currentTime = 0;
    };

    if (callStatus === "DISCONNECTED") {
      cancelReplay();
      sound.pause();
      sound.currentTime = 0;
      sound.onended = () => {
        replayRef.current = setTimeout(() => {
          sound.currentTime = 0;
          sound.play();
        }, 3000) as unknown as number;
      };
      sound.play();
    } else {
      stop();
    }

    return cancelReplay;
  }, [callStatus, sound]);
}
