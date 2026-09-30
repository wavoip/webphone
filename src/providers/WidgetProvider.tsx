import { type Accessor, createContext, createSignal, type JSX, onCleanup, onMount, Show, useContext } from "solid-js";
import { Phone } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { resolveWebphonePosition, resolveWidgetButtonPosition } from "@/lib/widget-position";
import { useStore } from "@/middleware/solid/context";
import { useSurface } from "@/providers/SurfaceProvider";
import { useSettings } from "@/providers/settings/Provider";

type Position = { x: number; y: number };

interface WidgetContextType {
  position: Accessor<Position>;
  buttonPosition: Accessor<Position>;
  isDragging: Accessor<boolean>;
  isClosed: Accessor<boolean>;
  setPosition: (pos: Position) => void;
  startDrag: (e: MouseEvent) => void;
  stopDrag: () => void;
  setIsClosed: (closed: boolean) => void;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const WidgetContext = createContext<WidgetContextType>();

export function WidgetProvider(props: { children: JSX.Element }) {
  const state = useStore();
  const { position: positionInitial, buttonPosition: buttonPositionInitial } = useSettings();
  const { isPiP, layout } = useSurface();
  const isFilled = layout === "filled";

  const [isDragging, setIsDragging] = createSignal(false);
  let widgetEl: HTMLDivElement | undefined;
  let offset: Position = { x: 0, y: 0 };

  const handleMouseMove = (e: MouseEvent) => {
    if (!widgetEl) return;
    let x = Math.max(0, e.clientX - offset.x);
    let y = Math.max(0, e.clientY - offset.y);

    const rect = widgetEl.getBoundingClientRect();
    if (x > window.innerWidth - rect.width) x = window.innerWidth - rect.width;
    if (y > window.innerHeight - rect.height) y = window.innerHeight - rect.height;

    state.setWidgetPosition({ x, y });
  };

  const startDrag = (e: MouseEvent) => {
    // Ocupando a janela inteira não há para onde arrastar, e a barra de status segue
    // chamando isto sem saber em que modo está.
    if (isFilled) return;
    document.body.style.userSelect = "none";
    setIsDragging(true);
    offset = { x: e.clientX - state.position.x, y: e.clientY - state.position.y };
    document.addEventListener("mousemove", handleMouseMove);
  };

  const stopDrag = () => {
    setIsDragging(false);
    document.body.style.userSelect = "unset";
    document.removeEventListener("mousemove", handleMouseMove);
  };

  onMount(() => {
    const rect = widgetEl?.getBoundingClientRect();
    // Widget que começa fechado está em `display:none` e mede zero; o tamanho padrão do
    // resolver mantém as posições por palavra ("bottom-left") dentro do viewport.
    const size = rect && rect.width > 0 && rect.height > 0 ? { width: rect.width, height: rect.height } : undefined;
    state.setWidgetPosition(resolveWebphonePosition(positionInitial, size));
    state.setButtonPosition(resolveWidgetButtonPosition(buttonPositionInitial));

    document.addEventListener("mouseleave", stopDrag);
    window.addEventListener("resize", handleResize);
    onCleanup(() => {
      document.removeEventListener("mouseleave", stopDrag);
      window.removeEventListener("resize", handleResize);
    });
  });

  function handleResize() {
    if (!widgetEl) return;
    const rect = widgetEl.getBoundingClientRect();
    let x: number | null = null;
    let y: number | null = null;
    if (rect.x + rect.width > window.innerWidth) x = window.innerWidth - rect.width;
    if (rect.y + rect.height > window.innerHeight) y = Math.max(0, window.innerHeight - rect.height);
    if (x !== null || y !== null) {
      state.setWidgetPosition({ x: x ?? state.position.x, y: y ?? state.position.y });
    }
    state.setButtonPosition(resolveWidgetButtonPosition(buttonPositionInitial));
  }

  const value: WidgetContextType = {
    position: () => state.position,
    buttonPosition: () => state.buttonPosition,
    isDragging,
    isClosed: () => state.isClosed,
    setPosition: (pos) => state.setWidgetPosition(pos),
    startDrag,
    stopDrag,
    setIsClosed: (closed) => (closed ? state.closeWidget() : state.openWidget()),
    close: () => state.closeWidget(),
    open: () => state.openWidget(),
    toggle: () => state.toggleWidget(),
  };

  return (
    <WidgetContext.Provider value={value}>
      <Show when={state.settings.showWidgetButton && !isPiP()}>
        <Button
          type="button"
          onClick={() => state.openWidget()}
          size="icon"
          data-closed={state.isClosed}
          class="wv:fixed wv:bottom-6 wv:right-6 wv:z-50 wv:transition wv:data-[closed=false]:hidden wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-widget-background wv:text-widget-text wv:font-bold wv:hover:bg-widget-background-hover"
        >
          <Phone class="wv:size-8" />
        </Button>
      </Show>

      <Toaster position="top-right" class="!w-[400px]" toastOptions={{ class: "wv:max-w-[400px] wv:w-full" }} />

      <div
        ref={widgetEl}
        data-closed={state.isClosed}
        class={
          isFilled
            ? "wv:data-[closed=true]:hidden wv:flex wv:flex-col wv:w-full wv:h-dvh wv:max-w-[420px] wv:mx-auto wv:bg-background wv:touch-manipulation"
            : "wv:data-[closed=true]:hidden wv:flex wv:flex-col wv:w-70 wv:h-120 wv:rounded-2xl wv:max-sm:w-dvw wv:max-sm:h-dvh wv:max-sm:!left-[0px] wv:max-sm:!top-[0px] wv:bg-background wv:shadow-lg wv:touch-manipulation"
        }
        style={
          isFilled ? undefined : { position: "fixed", left: `${state.position.x}px`, top: `${state.position.y}px` }
        }
      >
        {props.children}
      </div>
    </WidgetContext.Provider>
  );
}

export function useWidget(): WidgetContextType {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error("useWidget deve ser usado dentro de <WidgetProvider>");
  return ctx;
}
