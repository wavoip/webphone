import { createSignal, For, Show } from "solid-js";
import SoundBackspace from "@/assets/sounds/backspace.mp3";
import SoundDTMF0 from "@/assets/sounds/dtmf-0.mp3";
import SoundDTMF1 from "@/assets/sounds/dtmf-1.mp3";
import SoundDTMF2 from "@/assets/sounds/dtmf-2.mp3";
import SoundDTMF3 from "@/assets/sounds/dtmf-3.mp3";
import SoundDTMF4 from "@/assets/sounds/dtmf-4.mp3";
import SoundDTMF5 from "@/assets/sounds/dtmf-5.mp3";
import SoundDTMF6 from "@/assets/sounds/dtmf-6.mp3";
import SoundDTMF7 from "@/assets/sounds/dtmf-7.mp3";
import SoundDTMF8 from "@/assets/sounds/dtmf-8.mp3";
import SoundDTMF9 from "@/assets/sounds/dtmf-9.mp3";
import SoundDTMFHash from "@/assets/sounds/dtmf-hash.mp3";
import SoundDTMFStar from "@/assets/sounds/dtmf-star.mp3";
import { Backspace, CaretDown, Phone, PhoneSlash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecentNumbersDropdown } from "@/components/ui/recentNumbers";
import { type TranslationKey, t } from "@/lib/i18n";
import { useMiddleware, useStore } from "@/middleware/solid/context";

const buttons = [
  { digit: "1", letters: "", audio: new Audio(SoundDTMF1) },
  { digit: "2", letters: "ABC", audio: new Audio(SoundDTMF2) },
  { digit: "3", letters: "DEF", audio: new Audio(SoundDTMF3) },
  { digit: "4", letters: "GHI", audio: new Audio(SoundDTMF4) },
  { digit: "5", letters: "JKL", audio: new Audio(SoundDTMF5) },
  { digit: "6", letters: "MNO", audio: new Audio(SoundDTMF6) },
  { digit: "7", letters: "PQRS", audio: new Audio(SoundDTMF7) },
  { digit: "8", letters: "TUV", audio: new Audio(SoundDTMF8) },
  { digit: "9", letters: "WXYZ", audio: new Audio(SoundDTMF9) },
  { digit: "*", letters: "", audio: new Audio(SoundDTMFStar) },
  { digit: "0", letters: "+", audio: new Audio(SoundDTMF0) },
  { digit: "#", letters: "", audio: new Audio(SoundDTMFHash) },
];

const backspace_audio = new Audio(SoundBackspace);

export default function KeyboardScreen() {
  const middleware = useMiddleware();
  const state = useStore();
  const [recentOpen, setRecentOpen] = createSignal(false);

  const enabledTokens = () => state.devices.filter((d) => d.enable).map((d) => d.token);

  const submit = (e: Event) => {
    e.preventDefault();
    if (!state.keyboardInput.trim()) return;
    // Sem isto o Enter começa uma segunda discagem: carregando, não há botão de submit no
    // DOM, e o navegador deixa de bloquear o submit implícito.
    if (state.dialIsLoading) return;
    void middleware.controllers.call.dial(state.keyboardInput, enabledTokens());
  };

  return (
    <form onSubmit={submit} class="wv:flex wv:flex-col wv:size-full wv:items-center wv:justify-evenly wv:px-2 wv:pb-4">
      <div class="wv:text-center">
        <div class="wv:relative">
          <Input
            placeholder={t("Type...")}
            value={state.keyboardInput}
            onFocus={() => setRecentOpen(true)}
            onBlur={() => setRecentOpen(false)}
            onInput={(e) => {
              const digits = e.currentTarget.value.match(/[\d*#]+/g)?.[0] || "";
              state.setKeyboardInput(digits);
            }}
            class="wv:border-none wv:border-l-0 wv:border-r-0 wv:border-t-0 wv:shadow-none wv:rounded-none wv:!text-foreground wv:text-center wv:focus-visible:ring-0 wv:text-[32px] wv:max-sm:text-[30px] wv:md:text-[24px] wv:!bg-[transparent]"
          />
          <button
            type="button"
            title={t("Recent numbers")}
            aria-label={t("Recent numbers")}
            aria-expanded={recentOpen()}
            onMouseDown={(e) => e.preventDefault()} // não rouba o foco do input
            onClick={() => setRecentOpen((aberto) => !aberto)}
            class="wv:absolute wv:right-0 wv:top-1/2 wv:-translate-y-1/2 wv:p-1 wv:text-muted-400 wv:cursor-pointer"
          >
            <CaretDown
              class={`wv:size-4 wv:transition-transform wv:duration-200 ${recentOpen() ? "wv:rotate-180" : ""}`}
            />
          </button>

          <RecentNumbersDropdown
            open={recentOpen()}
            numbers={state.recentNumbers}
            onSelect={(recent) => {
              state.setKeyboardInput(recent);
              setRecentOpen(false);
            }}
          />
        </div>

        <Show when={state.dialError}>
          {(codigo) => (
            <p class="wv:text-[12px] wv:font-light wv:text-red-400 wv:tracking-[.15em]">
              {t(codigo() as TranslationKey)}
            </p>
          )}
        </Show>

        <Show when={state.dialStatus}>
          {(device) => (
            <div class="wv:flex wv:flex-row wv:gap-2 wv:items-center wv:justify-center">
              <Show when={state.dialIsLoading}>
                <div class="wv:h-3 wv:w-3 wv:shrink-0 wv:animate-spin wv:rounded-full wv:border-2 wv:border-[gray] wv:border-t-transparent" />
              </Show>
              <p class="wv:text-[12px] wv:font-light wv:text-[gray] wv:tracking-[.15em]">
                {t("Calling from")} {device()}
              </p>
            </div>
          )}
        </Show>
      </div>

      <div data-slot="keyboard-grid" class="wv:flex wv:max-w-[300px] wv:w-full">
        <div
          data-slot="keyboard-buttons"
          class="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-3 wv:[&>*]:select-none wv:[&>*]:max-w-[80px] wv:[&>*]:max-h-[80px] wv:justify-items-center"
        >
          <For each={buttons}>
            {({ digit, letters, audio }) => (
              <Button
                type="button"
                variant="secondary"
                class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:cursor-pointer wv:text-foreground wv:bg-muted wv:hover:bg-accent wv:active:bg-accent/60 wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0 wv:transition-colors wv:duration-200 wv:touch-manipulation"
                onClick={() => {
                  state.appendKeyboardChar(digit);
                  audio.pause();
                  audio.currentTime = 0;
                  audio.volume = 0.25;
                  audio.play();
                }}
              >
                <p class="wv:text-[24px] wv:leading-6 wv:font-semibold">{digit}</p>
                <Show when={letters}>
                  <p class="wv:text-[12px] wv:font-light wv:text-muted-400 wv:tracking-[.15em]">{letters}</p>
                </Show>
              </Button>
            )}
          </For>
        </div>
      </div>

      <div data-slot="keyboard-grid" class="wv:flex wv:max-w-[300px] wv:w-full">
        <div
          data-slot="keyboard-buttons"
          class="wv:grid wv:grid-cols-3 wv:grid-rows-1 wv:w-full wv:gap-3 wv:[direction:rtl] wv:[&>*]:select-none wv:[&>*]:max-w-[80px] wv:[&>*]:max-h-[80px] wv:justify-items-center wv:items-center"
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            title={t("Erase digit")}
            aria-label={t("Erase digit")}
            onClick={() => {
              backspace_audio.pause();
              backspace_audio.currentTime = 0;
              backspace_audio.play();
              state.popKeyboardChar();
            }}
            class="wv:aspect-square wv:size-fit wv:p-2 wv:shadow-none wv:bg-[transparent] wv:hover:bg-[transparent] wv:hover:text-[green] wv:text-foreground wv:hover:cursor-pointer wv:h-[56px] wv:touch-manipulation"
          >
            <Backspace class="wv:size-5 wv:max-sm:size-8" />
          </Button>

          {/* Discando, o botão verde vira a saída do loop. */}
          <Show
            when={state.dialIsLoading}
            fallback={
              <Button
                type="submit"
                size="icon"
                title={t("Call")}
                aria-label={t("Call")}
                class="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-green-700 wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
              >
                <Phone filled class="wv:size-7" />
              </Button>
            }
          >
            <Button
              type="button"
              size="icon"
              title={t("Abort")}
              aria-label={t("Abort")}
              onClick={() => middleware.controllers.call.abortDial()}
              class="wv:aspect-square wv:size-full wv:rounded-full wv:bg-[#e7000b] wv:hover:bg-red-800 wv:hover:text-background wv:hover:cursor-pointer wv:text-[white] wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
            >
              <PhoneSlash filled class="wv:size-7" />
            </Button>
          </Show>
        </div>
      </div>
    </form>
  );
}
