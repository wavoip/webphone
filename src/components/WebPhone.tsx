import { Match, Show, Switch } from "solid-js";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { PipPortal } from "@/components/PipPortal";
import { wireCallToInterface } from "@/lib/call-effects";
import { useMiddleware, useStore } from "@/middleware/solid/context";
import { useMount } from "@/providers/MountProvider";
import { usePip } from "@/providers/PipProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function WebPhone() {
  const state = useStore();
  const { startDrag, stopDrag } = useWidget();
  const { root } = useMount();
  const { pipWindow, isPiP } = usePip();

  // Aqui dentro porque depende de widget e de Picture-in-Picture, que são os providers
  // logo acima.
  wireCallToInterface(useMiddleware());

  const resolvedTheme = () => (root.classList.contains("dark") ? "dark" : "light");

  const handleMouseDown = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    document.body.style.userSelect = "unset";
    startDrag(e);
  };

  const telaAtual = () => (
    <Switch>
      <Match when={state.screen === "keyboard"}>
        <KeyboardScreen />
      </Match>
      <Match when={state.screen === "call"}>
        <CallScreen />
      </Match>
      <Match when={state.screen === "outgoing"}>
        <OutgoingScreen />
      </Match>
    </Switch>
  );

  return (
    <>
      <StatusBar />
      <div
        role="application"
        class="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={stopDrag}
        onMouseDown={handleMouseDown}
      >
        <Show when={state.screen === "keyboard"}>
          <KeyboardScreen />
        </Show>
        {/* Com o PiP aberto a chamada mora lá; deixar as duas montadas daria dois
            KeyboardScreen disputando o mesmo laço de discagem. */}
        <Show when={!isPiP()}>
          <Show when={state.screen === "outgoing"}>
            <OutgoingScreen />
          </Show>
          <Show when={state.screen === "call"}>
            <CallScreen />
          </Show>
        </Show>

        <p
          class="wv:text-neutral-500 pointer-events-none wv:absolute wv:bottom-1 wv:left-2 wv:select-none wv:z-50 wv:text-[12px]"
          aria-hidden="true"
        >
          v {__WEBPHONE_VERSION__}
        </p>
      </div>

      <Show when={pipWindow()}>
        {(janela) => (
          <PipPortal pipWindow={janela()} theme={resolvedTheme()}>
            {telaAtual()}
          </PipPortal>
        )}
      </Show>
    </>
  );
}
