const STORAGE_KEY = "wavoip:audio";

export type AudioSettings = {
  micId: string | null;
  speakerId: string | null;
};

const empty: AudioSettings = { micId: null, speakerId: null };

export function getAudioSettings(): AudioSettings {
  if (typeof localStorage === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      micId: typeof parsed.micId === "string" ? parsed.micId : null,
      speakerId: typeof parsed.speakerId === "string" ? parsed.speakerId : null,
    };
  } catch {
    return empty;
  }
}

export function setAudioSettings(settings: AudioSettings): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
