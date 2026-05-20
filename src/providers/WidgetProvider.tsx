import { PhoneIcon } from "@phosphor-icons/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { resolveWebphonePosition, resolveWidgetButtonPosition } from "@/lib/widget-position";
import { useMiddleware } from "@/middleware/react/hooks";
import { useSettings } from "@/providers/settings/Provider";
import { useTheme } from "@/providers/ThemeProvider";

type Position = { x: number; y: number };

interface WidgetContextType {
  position: Position;
  buttonPosition: Position;
  isDragging: boolean;
  setPosition: (pos: Position) => void;
  startDrag: (e: MouseEvent) => void;
  stopDrag: () => void;
  isClosed: boolean;
  setIsClosed: (closed: boolean) => void;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

type Props = { children: ReactNode };

export function WidgetProvider({ children }: Props) {
  const middleware = useMiddleware();
  const { theme } = useTheme();
  const { widget, position: positionInitial, buttonPosition: buttonPositionInitial } = useSettings();

  const { isClosed, position, buttonPosition, showWidget } = useStore(
    middleware.store,
    useShallow((s) => ({
      isClosed: s.isClosed,
      position: s.position,
      buttonPosition: s.buttonPosition,
      showWidget: s.settings.showWidgetButton,
    })),
  );

  const { setStorePosition, setStoreButtonPosition, openStore, closeStore, toggleStore, setSetting } = useStore(
    middleware.store,
    useShallow((s) => ({
      setStorePosition: s.setWidgetPosition,
      setStoreButtonPosition: s.setButtonPosition,
      openStore: s.openWidget,
      closeStore: s.closeWidget,
      toggleStore: s.toggleWidget,
      setSetting: s.setSetting,
    })),
  );

  useSeedSettingsOnce(widget.show, widget.startOpen, setSetting, openStore, closeStore);

  const [isDragging, setIsDragging] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!divRef.current) return;
      let x = e.clientX - offsetRef.current.x;
      let y = e.clientY - offsetRef.current.y;

      if (x < 0) x = 0;
      if (y < 0) y = 0;

      const rect = divRef.current.getBoundingClientRect();
      if (x > window.innerWidth - rect.width) x = window.innerWidth - rect.width;
      if (y > document.body.clientHeight - rect.height) y = document.body.clientHeight - rect.height;

      setStorePosition({ x, y });
    },
    [setStorePosition],
  );

  const startDrag = useCallback(
    (e: MouseEvent) => {
      document.body.style.userSelect = "none";
      setIsDragging(true);
      offsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      document.addEventListener("mousemove", handleMouseMove);
    },
    [handleMouseMove, position.x, position.y],
  );

  const stopDrag = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = "unset";
    document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useLayoutEffect(() => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setStorePosition(resolveWebphonePosition(positionInitial, { width: rect.width, height: rect.height }));
    setStoreButtonPosition(resolveWidgetButtonPosition(buttonPositionInitial));
    document.addEventListener("mouseleave", stopDrag);
    return () => {
      document.removeEventListener("mouseleave", stopDrag);
    };
  }, [stopDrag, positionInitial, buttonPositionInitial, setStorePosition, setStoreButtonPosition]);

  useLayoutEffect(() => {
    function handleResize() {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      let x: number | null = null;
      let y: number | null = null;
      if (rect.x + rect.width > window.innerWidth) x = window.innerWidth - rect.width;
      if (rect.y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height;
        if (y < 0) y = 0;
      }
      if (x !== null || y !== null) {
        const current = middleware.store.getState().position;
        setStorePosition({ x: x ?? current.x, y: y ?? current.y });
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [middleware, setStorePosition]);

  const setIsClosed = useCallback(
    (closed: boolean) => (closed ? closeStore() : openStore()),
    [openStore, closeStore],
  );

  return (
    <WidgetContext.Provider
      value={{
        position,
        buttonPosition,
        setPosition: setStorePosition,
        startDrag,
        stopDrag,
        isDragging,
        isClosed,
        setIsClosed,
        close: closeStore,
        open: openStore,
        toggle: toggleStore,
      }}
    >
      {showWidget && (
        <Button
          type="button"
          onClick={openStore}
          size={"icon"}
          data-closed={isClosed}
          className="wv:transition wv:data-[closed=false]:hidden wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-widget-background wv:text-widget-text wv:font-bold wv:hover:bg-widget-background-hover"
          style={{ position: "fixed", top: buttonPosition.y, left: buttonPosition.x }}
        >
          <PhoneIcon className="wv:size-8" />
        </Button>
      )}

      <Toaster
        theme={theme}
        position="top-right"
        className="!w-[400px]"
        toastOptions={{ className: "wv:max-w-[400px] wv:w-full" }}
      />

      <div
        ref={divRef}
        data-closed={isClosed}
        className="wv:data-[closed=true]:hidden wv:flex wv:flex-col wv:w-70 wv:h-120 wv:rounded-2xl wv:max-sm:w-dvw wv:max-sm:h-dvh wv:max-sm:!left-[0px] wv:max-sm:!top-[0px] wv:bg-background wv:shadow-lg wv:touch-manipulation"
        style={{ position: "fixed", left: position.x, top: position.y }}
      >
        {children}
      </div>
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error("useWidget deve ser usado dentro de <WidgetProvider>");
  return ctx;
}

function useSeedSettingsOnce(
  showWidget: boolean,
  startOpen: boolean | undefined,
  setSetting: (key: "showWidgetButton", value: boolean) => void,
  openStore: () => void,
  closeStore: () => void,
) {
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setSetting("showWidgetButton", showWidget);
    if (startOpen) openStore();
    else closeStore();
  }, [showWidget, startOpen, setSetting, openStore, closeStore]);
}
