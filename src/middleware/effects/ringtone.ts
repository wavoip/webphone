import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

export type RingtonePlayer = {
  start: () => void;
  stop: () => void;
};

type Deps = {
  store: MiddlewareStoreApi;
  ringtone: RingtonePlayer;
  vibration: RingtonePlayer;
};

export type Unsubscribe = () => void;

export function ringtoneEffect({ store, ringtone, vibration }: Deps): Unsubscribe {
  return store.subscribe(
    (state) => state.offers.length,
    (count, previous) => {
      if (previous === 0 && count > 0) {
        ringtone.start();
        vibration.start();
        return;
      }
      if (previous > 0 && count === 0) {
        ringtone.stop();
        vibration.stop();
      }
    },
  );
}

/**
 * Wraps an `HTMLAudioElement` in the {@link RingtonePlayer} interface used by
 * {@link ringtoneEffect}. Tests provide a different player.
 */
export function audioRingtonePlayer(audio: HTMLAudioElement, volume = 0.25): RingtonePlayer {
  return {
    start() {
      audio.loop = true;
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    stop() {
      audio.pause();
    },
  };
}
