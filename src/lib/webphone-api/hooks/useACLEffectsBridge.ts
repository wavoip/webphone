import { useEffect } from "react";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { disablePiP } from "@/lib/picture-in-picture";
import { bus } from "@/lib/webphone-api/bus";
import { useScreen } from "@/providers/ScreenProvider";

const ringtone_sound = new Audio(Ringtone);
const vibration_sound = new Audio(Vibration);

function startRingtone() {
  ringtone_sound.currentTime = 0;
  ringtone_sound.loop = true;
  ringtone_sound.volume = 0.25;
  ringtone_sound.play();

  vibration_sound.loop = true;
  vibration_sound.currentTime = 0;
  vibration_sound.volume = 0.25;
  vibration_sound.play();
}

function stopRingtone() {
  ringtone_sound.pause();
  vibration_sound.pause();
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
  return "";
}

function enableConfirmClose() {
  window.addEventListener("beforeunload", handleBeforeUnload);
}

function disableConfirmClose() {
  window.removeEventListener("beforeunload", handleBeforeUnload);
}

export function useACLEffectsBridge(): void {
  const { setScreen } = useScreen();

  useEffect(() => {
    const unsubs = [
      bus.on("fx.ringtone.start", startRingtone),
      bus.on("fx.ringtone.stop", stopRingtone),
      bus.on("fx.unloadConfirm.enable", enableConfirmClose),
      bus.on("fx.unloadConfirm.disable", disableConfirmClose),
      bus.on("fx.pip.disable", disablePiP),
      bus.on("fx.screen.set", (screen) => setScreen(screen)),
    ];
    return () => {
      for (const u of unsubs) u();
    };
  }, [setScreen]);
}
