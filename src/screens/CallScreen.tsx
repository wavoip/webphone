import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import HangUp from "@/assets/sounds/hangup.mp3";
import Reconnecting from "@/assets/sounds/reconnecting.mp3";
import { CallButtons } from "@/components/CallButtons";
import { ContactAvatar } from "@/components/ContactAvatar";
import { CopyablePeer } from "@/components/CopyablePeer";
import { MicrophoneSlash, WhatsappLogo } from "@/components/icons";
import { WaveSound } from "@/components/WaveSound";
import { type TranslationKey, t } from "@/lib/i18n";
import { useStore } from "@/middleware/solid/context";
import { isTerminalCallStatus } from "@/middleware/store/callStatus";
import { useReconnectingSound } from "./useReconnectingSound";

const hang_up_sound = new Audio(HangUp);
const reconnecting_sound = new Audio(Reconnecting);

export default function CallScreen() {
  const state = useStore();
  const [durationSeconds, setDurationSeconds] = createSignal(
    state.activeStartedAt ? Math.floor((Date.now() - state.activeStartedAt) / 1000) : 0,
  );

  // Dono único do som de reconexão. Havia uma segunda cópia desta regra aqui, com um
  // timer que ninguém cancelava — o problema que este hook existe para evitar.
  useReconnectingSound(() => state.callStatus, reconnecting_sound);

  const status = createMemo(() => {
    // Chamada conectada normalmente termina em ENDED, mas quem decide é o servidor, e ele
    // pode mandar CANCELLED aqui.
    if (state.callStatus === "CANCELLED") return t("Call canceled");
    if (state.callStatus === "ENDED") return t("Call ended");
    if (state.callStatus === "DISCONNECTED") return t("Reconnecting");
    if (state.callStatus !== "FAILED") return null;
    return state.callFailReason
      ? `${t("The call failed")}: ${t(state.callFailReason as TranslationKey)}`
      : t("The call failed");
  });

  createEffect(() => {
    if (!isTerminalCallStatus(state.callStatus)) return;
    hang_up_sound.pause();
    hang_up_sound.currentTime = 0;
    hang_up_sound.play();
  });

  createEffect(() => {
    if (isTerminalCallStatus(state.callStatus)) return;
    const id = setInterval(() => setDurationSeconds((s) => s + 1), 1000);
    onCleanup(() => clearInterval(id));
  });

  return (
    <div class="wv:size-full wv:flex wv:flex-col wv:px-2 wv:pt-4">
      <div class="wv:size-full wv:flex wv:flex-col wv:gap-4">
        <div
          data-slot="call-type"
          class="wv:flex wv:flex-row wv:justify-start wv:items-center wv:gap-2 wv:opacity-50 wv:text-foreground "
        >
          <WhatsappLogo size={20} />
          <p class="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div class="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <ContactAvatar
            class="wv:size-[50px] wv:rounded-xl"
            src={state.active?.peer.profilePicture}
            displayName={state.active?.peer?.displayName}
          />
          <div class="wv:flex wv:flex-col wv:justify-center wv:items-start wv:overflow-hidden">
            <p class="wv:text-foreground wv:opacity-75 wv:text-[14px]">
              {status() || formatDuration(durationSeconds())}
            </p>

            <div class="wv:flex wv:flex-col wv:font-normal wv:w-full">
              <CopyablePeer
                displayName={state.active?.peer.displayName}
                phone={state.active?.peer.phone ?? ""}
                class="wv:text-foreground wv:text-[24px] wv:leading-[28px]"
              />
            </div>
          </div>
        </div>

        <div class="wv:flex wv:grow-1 wv:justify-center wv:items-end wv:pb-[15px] wv:opacity-80">
          <Show when={state.peerMuted} fallback={<WaveSound call={state.active} />}>
            <div class="wv:flex wv:text-foreground wv:h-[40px] wv:items-center wv:justify-cente wv:gap-1">
              <MicrophoneSlash />
              <p class="wv:text-[16px]">{t("Muted")}</p>
            </div>
          </Show>
        </div>
      </div>

      <CallButtons call={state.active} />
    </div>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60 - hours * 60);
  const secondsRest = seconds - minutes * 60;

  if (hours) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secondsRest.toString().padStart(2, "0")}`;
}
