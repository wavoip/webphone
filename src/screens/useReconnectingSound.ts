import { createEffect, onCleanup } from "solid-js";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

/**
 * O timer da próxima repetição é cancelado na recuperação, no fim e ao desmontar — senão
 * um timer agendado nos 3s de silêncio toca na chamada que já voltou ou já acabou.
 */
export function useReconnectingSound(callStatus: () => CallStatus, sound: HTMLAudioElement) {
  let replay: ReturnType<typeof setTimeout> | null = null;

  const cancelReplay = () => {
    if (!replay) return;
    clearTimeout(replay);
    replay = null;
  };

  const stop = () => {
    sound.onended = null;
    cancelReplay();
    sound.pause();
    sound.currentTime = 0;
  };

  createEffect(() => {
    if (callStatus() !== "DISCONNECTED") {
      stop();
      return;
    }
    cancelReplay();
    sound.pause();
    sound.currentTime = 0;
    sound.onended = () => {
      replay = setTimeout(() => {
        sound.currentTime = 0;
        sound.play();
      }, 3000);
    };
    sound.play();
  });

  onCleanup(cancelReplay);
}
