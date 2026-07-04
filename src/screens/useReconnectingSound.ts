import { useEffect, useRef } from "react";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

/**
 * Drives the looping "reconnecting" tone off call status. Plays while the call
 * is DISCONNECTED (media leg dropped) and re-triggers 3s after each loop ends;
 * stops on any other status.
 *
 * The pending replay timer is tracked and cancelled on recovery (ACTIVE), end,
 * or unmount — otherwise a timer scheduled during the 3s silent gap fires a
 * stray tone into the already-recovered/ended call.
 *
 * @example useReconnectingSound(callStatus, reconnectingAudio)
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
