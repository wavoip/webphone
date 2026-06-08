import type { MicrophonePermissionState } from "@wavoip/wavoip-api";
import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

export type AudioDevices = {
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};

export type AudioSliceState = {
  micPermission: MicrophonePermissionState;
  availableAudio: AudioDevices;
  selectedMicId: string | null;
  selectedSpeakerId: string | null;
};

export type AudioSliceActions = {
  setMicPermission: (state: MicrophonePermissionState) => void;
  setAvailableAudio: (devices: AudioDevices) => void;
  setSelectedMic: (id: string | null) => void;
  setSelectedSpeaker: (id: string | null) => void;
};

export type AudioSlice = AudioSliceState & AudioSliceActions;

export const createAudioSlice: StateCreator<MiddlewareStore, [], [], AudioSlice> = (set) => ({
  micPermission: "unknown",
  availableAudio: { mics: [], speakers: [] },
  selectedMicId: null,
  selectedSpeakerId: null,
  setMicPermission: (micPermission) => set({ micPermission }),
  setAvailableAudio: (availableAudio) => set({ availableAudio }),
  setSelectedMic: (selectedMicId) => set({ selectedMicId }),
  setSelectedSpeaker: (selectedSpeakerId) => set({ selectedSpeakerId }),
});
