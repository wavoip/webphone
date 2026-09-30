import { createEffect, createMemo, onCleanup, Show } from "solid-js";
import Calling from "@/assets/sounds/calling.mp3";
import PostalCode from "@/assets/sounds/postalcode.mp3";
import { CallButtons } from "@/components/CallButtons";
import { ContactAvatar } from "@/components/ContactAvatar";
import { WhatsappLogo } from "@/components/icons";
import MarqueeText from "@/components/MarqueeText";
import { type TranslationKey, t } from "@/lib/i18n";
import { useStore } from "@/middleware/solid/context";

const calling_sound = new Audio(Calling);
calling_sound.preload = "auto";
const postalcode_sound = new Audio(PostalCode);

function silenciar() {
  for (const som of [calling_sound, postalcode_sound]) {
    som.pause();
    som.currentTime = 0;
  }
}

export default function OutgoingScreen() {
  const state = useStore();

  const displayName = () => state.outgoing?.peer.displayName || state.outgoing?.peer.phone || state.keyboardInput;

  const status = createMemo(() => {
    if (!state.outgoing && state.keyboardInput) return t("Connecting...");
    switch (state.callStatus) {
      case "CALLING":
        return t("Connecting...");
      case "RINGING":
        return t("Calling...");
      case "FAILED":
        return state.callFailReason
          ? `${t("The call failed")}: ${t(state.callFailReason as TranslationKey)}`
          : t("The call failed");
      case "REJECTED":
        return t("Call rejected");
      case "NOT_ANSWERED":
        return t("Call unanswered");
      case "ENDED":
        return t("Call ended");
      // Não é necessariamente *nós* cancelando: quem recebe desligar antes de atender
      // também cai aqui, por isso o texto é neutro.
      case "CANCELLED":
        return t("Call canceled");
      default:
        return null;
    }
  });

  createEffect(() => {
    const atual = state.callStatus;
    if (atual === "RINGING") {
      calling_sound.currentTime = 0;
      calling_sound.volume = 0.25;
      calling_sound.loop = true;
      calling_sound.play();
      return;
    }
    if (atual === "FAILED" || atual === "NOT_ANSWERED") {
      silenciar();
      postalcode_sound.volume = 0.25;
      postalcode_sound.play();
      return;
    }
    // "CALLING" é o intervalo entre discar e o servidor confirmar que tocou: não é
    // silêncio, é ainda-não-começou.
    if (atual !== "CALLING") silenciar();
  });

  onCleanup(silenciar);

  return (
    <div class="wv:size-full wv:flex wv:flex-col wv:px-2 wv:pt-4">
      <div class="wv:size-full wv:flex wv:flex-col wv:gap-4">
        <div data-slot="call-type" class="wv:flex wv:flex-row wv:justify-start wv:items-center wv:gap-2 wv:opacity-50 ">
          <WhatsappLogo size={20} />
          <p class="wv:text-foreground wv:text-[14px] select-none">Whatsapp Audio</p>
        </div>

        <div class="wv:flex wv:flex-row wv:justify-start wv:items-start wv:gap-4 wv:overflow-hidden">
          <ContactAvatar
            class="wv:size-[50px] wv:rounded-xl"
            src={state.outgoing?.peer.profilePicture}
            displayName={state.outgoing?.peer?.displayName}
          />
          <div class="wv:flex wv:flex-col wv:justify-center wv:items-start">
            <Show when={status()}>
              {(texto) => (
                <p class="wv:text-foreground wv:opacity-75 wv:text-[14px] fade-text select-none">{texto()}</p>
              )}
            </Show>

            <div class="wv:relative wv:group/title wv:flex wv:flex-col wv:overflow-hidden wv:font-normal">
              <div class="wv:hidden  wv:group-hover/title:block">
                <MarqueeText speed={10} class="wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:select-none">
                  {displayName()}
                </MarqueeText>
              </div>

              <p class="wv:block wv:group-hover/title:hidden wv:text-foreground wv:text-[24px] wv:leading-[28px] wv:font-normal wv:truncate w-48">
                {displayName()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CallButtons call={state.outgoing} />
    </div>
  );
}
