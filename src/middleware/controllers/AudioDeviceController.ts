import type { MicrophonePermissionState, Wavoip } from "@wavoip/wavoip-api";
import { getAudioSettings } from "@/lib/audio-settings";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { AudioDevices } from "@/middleware/store/slices/audioSlice";

type Deps = { wavoip: Wavoip; store: MiddlewareStoreApi };

/**
 * Owns the audio side of the store: seeds initial permission + device state
 * from the SDK, keeps it live via SDK subscriptions, and forwards user choices
 * back to the SDK for hot-swap. The controller never reads
 * `navigator.mediaDevices` directly — the SDK is the single source of truth.
 */
export class AudioDeviceController {
  private readonly deps: Deps;
  private unsubs: Array<() => void> = [];

  constructor(deps: Deps) {
    this.deps = deps;
  }

  /**
   * Seed the store with the SDK's current snapshot (permission + devices),
   * restore the persisted mic/speaker selection, subscribe to SDK events.
   * Idempotent: re-subscribes cleanly if called twice.
   */
  hydrate(): void {
    this.unsubscribeAll();

    const state = this.deps.store.getState();
    const devices = splitByKind(this.deps.wavoip.getMultimediaDevices());
    state.setMicPermission(this.deps.wavoip.getMicrophonePermission());
    state.setAvailableAudio(devices);

    const saved = getAudioSettings();
    if (saved.micId) state.setSelectedMic(saved.micId);
    if (saved.speakerId) state.setSelectedSpeaker(saved.speakerId);
    if (saved.micId && devices.mics.some((m) => m.deviceId === saved.micId)) {
      void this.deps.wavoip.setMicrophone(saved.micId);
    }
    this.ensureDefaults(devices);

    this.unsubs.push(
      this.deps.wavoip.onDevicesChanged((devices) => {
        const split = splitByKind(devices);
        this.deps.store.getState().setAvailableAudio(split);
        this.ensureDefaults(split);
      }),
      this.deps.wavoip.onMicrophonePermissionChanged((perm) => {
        this.deps.store.getState().setMicPermission(perm);
      }),
    );
  }

  /**
   * Surface the browser permission prompt via the SDK and let
   * `onMicrophonePermissionChanged` write the new state to the store.
   */
  async requestPermission(): Promise<MicrophonePermissionState> {
    return this.deps.wavoip.requestMicrophonePermission();
  }

  /**
   * Force the SDK to re-enumerate (and auto-unblock IDs when permission is
   * granted but Chromium is hiding them). The SDK fires `devicesChanged` which
   * the existing subscription writes to the store.
   */
  async refresh(): Promise<void> {
    await this.deps.wavoip.refreshMultimediaDevices();
  }

  /**
   * Persist the user's mic choice and forward to the SDK so a live call gets
   * a transport-level replaceTrack (WebRTC) or AudioInput rebuild (WebSocket).
   */
  async setMicrophone(deviceId: string): Promise<{ err: string | null }> {
    this.deps.store.getState().setSelectedMic(deviceId);
    return this.deps.wavoip.setMicrophone(deviceId);
  }

  /**
   * Speaker switching lives in the consumer because wavoip-api does not own
   * remote `<audio>` elements. We only persist the preference here.
   */
  setSpeaker(deviceId: string): void {
    this.deps.store.getState().setSelectedSpeaker(deviceId);
  }

  destroy(): void {
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    for (const unsub of this.unsubs) unsub();
    this.unsubs = [];
  }

  /**
   * When no selection is in the store (or the persisted selection vanished
   * from the OS), pick the system default — Chromium exposes the special
   * `deviceId === "default"` entry per kind; otherwise fall back to the first
   * device with a non-empty id. Pushes the mic choice to the SDK so a live
   * call hot-swaps to it; speaker is store-only.
   */
  private ensureDefaults(devices: AudioDevices): void {
    const state = this.deps.store.getState();
    const micId = pickDefaultId(devices.mics);
    if (micId && (!state.selectedMicId || !devices.mics.some((m) => m.deviceId === state.selectedMicId))) {
      state.setSelectedMic(micId);
      void this.deps.wavoip.setMicrophone(micId);
    }
    const speakerId = pickDefaultId(devices.speakers);
    if (
      speakerId &&
      (!state.selectedSpeakerId || !devices.speakers.some((s) => s.deviceId === state.selectedSpeakerId))
    ) {
      state.setSelectedSpeaker(speakerId);
    }
  }
}

function pickDefaultId(devices: MediaDeviceInfo[]): string | null {
  const flagged = devices.find((d) => d.deviceId === "default");
  if (flagged) return flagged.deviceId;
  const first = devices.find((d) => d.deviceId);
  return first?.deviceId ?? null;
}

function splitByKind(devices: MediaDeviceInfo[]): AudioDevices {
  return {
    mics: devices.filter((d) => d.kind === "audioinput"),
    speakers: devices.filter((d) => d.kind === "audiooutput"),
  };
}
