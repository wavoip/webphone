import { setAudioSettings } from "@/lib/audio-settings";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi };
export type Unsubscribe = () => void;

export function persistAudioEffect({ store }: Deps): Unsubscribe {
  return store.subscribe(
    (state) => ({ micId: state.selectedMicId, speakerId: state.selectedSpeakerId }),
    (selection) => setAudioSettings(selection),
    { equalityFn: (a, b) => a.micId === b.micId && a.speakerId === b.speakerId },
  );
}
