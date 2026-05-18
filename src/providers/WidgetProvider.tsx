import { PhoneIcon } from "@phosphor-icons/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { bus } from "@/lib/webphone-api/bus";
import { useBusState } from "@/lib/webphone-api/hooks/useBusState";
import { useSettings } from "@/providers/settings/Provider";
import type { WebphonePosition, WidgetButtonPosition } from "@/providers/settings/settings";
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
  setIsClosed: (isClosed: boolean) => void;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function WidgetProvider({ children }: Props) {
  const { theme } = useTheme();
  const { position: positionInitial, buttonPosition: buttonPositionInitial } = useSettings();

  const isOpen = useBusState("widget.isOpen", "widget.changed");
  const position = useBusState("position.value", "position.changed");
  const buttonPosition = useBusState("widget.buttonPosition", "widget.buttonPosition.changed");
  const showWidget = useBusState("settings.showWidgetButton", "settings.changed");
  const isClosed = !isOpen;

  const [isDragging, setIsDragging] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const setPosition = useCallback((value: Position) => {
    void bus.request("position.set", { value });
  }, []);

  const setButtonPosition = useCallback((value: WidgetButtonPosition) => {
    void bus.request("widget.buttonPosition.set", { value });
  }, []);

  const setIsClosed = useCallback((next: boolean) => {
    void bus.request("widget.setIsClosed", { isClosed: next });
  }, []);

  const open = useCallback(() => {
    void bus.request("widget.open", undefined);
  }, []);

  const close = useCallback(() => {
    void bus.request("widget.close", undefined);
  }, []);

  const toggle = useCallback(() => {
    void bus.request("widget.toggle", undefined);
  }, []);

  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!divRef.current) return;
      let x = e.clientX - offsetRef.current.x;
      let y = e.clientY - offsetRef.current.y;

      if (x < 0) x = 0;
      if (y < 0) y = 0;

      const rect = divRef.current.getBoundingClientRect();
      if (x > window.innerWidth - rect.width) {
        x = window.innerWidth - rect.width;
      }

      if (y > document.body.clientHeight - rect.height) {
        y = document.body.clientHeight - rect.height;
      }

      setPosition({ x, y });
    },
    [setPosition],
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

    setPosition(handlePositionInitialSettings(positionInitial, divRef as RefObject<HTMLDivElement>));
    setButtonPosition(buttonPositionInitial);

    document.addEventListener("mouseleave", stopDrag);

    return () => {
      document.removeEventListener("mouseleave", stopDrag);
    };
  }, [stopDrag, positionInitial, buttonPositionInitial, setPosition, setButtonPosition]);

  useLayoutEffect(() => {
    function handleResize() {
      if (!divRef.current) return;

      const div = divRef.current.getBoundingClientRect();
      let x: number | null = null;
      let y: number | null = null;

      if (div.x + div.width > window.innerWidth) {
        x = window.innerWidth - divRef.current.getBoundingClientRect().width;
      }

      if (div.y + div.height > window.innerHeight) {
        y = window.innerHeight - divRef.current.getBoundingClientRect().height;
        if (y < 0) y = 0;
      }

      if (x !== null || y !== null) {
        setPosition({ x: x ?? position.x, y: y ?? position.y });
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [position.x, position.y, setPosition]);

  useEffect(() => {
    return bus.handle("position.setRaw", async ({ value }) => {
      if (!divRef.current) return;
      const resolved = handlePositionInitialSettings(value, divRef as RefObject<HTMLDivElement>);
      await bus.request("position.set", { value: resolved });
    });
  }, []);

  return (
    <WidgetContext.Provider
      value={{
        position,
        buttonPosition,
        setPosition,
        startDrag,
        stopDrag,
        isDragging,
        isClosed,
        setIsClosed,
        close,
        open,
        toggle,
      }}
    >
      {showWidget && (
        <Button
          type="button"
          onClick={open}
          size={"icon"}
          data-closed={isClosed}
          className="wv:transition wv:data-[closed=false]:hidden wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-widget-background wv:text-widget-text wv:font-bold wv:hover:bg-widget-background-hover"
          style={{
            position: "fixed",
            top: buttonPosition.y,
            left: buttonPosition.x,
          }}
        >
          <PhoneIcon className="wv:size-8" />
        </Button>
      )}

      <Toaster
        theme={theme}
        position="top-right"
        className="!w-[400px]"
        toastOptions={{
          className: "wv:max-w-[400px] wv:w-full",
        }}
      />

      <div
        ref={divRef}
        data-closed={isClosed}
        className="wv:data-[closed=true]:hidden wv:flex wv:flex-col wv:w-70 wv:h-120 wv:rounded-2xl wv:max-sm:w-dvw wv:max-sm:h-dvh wv:max-sm:!left-[0px] wv:max-sm:!top-[0px] wv:bg-background wv:shadow-lg wv:touch-manipulation"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
        }}
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

function handlePositionInitialSettings(
  position: WebphonePosition,
  divRef: RefObject<HTMLDivElement>,
): { x: number; y: number } {
  const MARGIN = 24;

  if (typeof position === "object") {
    return position;
  }

  const rect = divRef.current.getBoundingClientRect();
  const middleY = window.innerHeight / 2 - rect.height / 2;
  const bottomY = window.innerHeight - MARGIN - rect.height;
  const middleX = window.innerWidth / 2 - rect.width / 2;
  const endX = window.innerWidth - MARGIN - rect.width;

  if (position === "top") return { x: middleX, y: MARGIN };
  if (position === "bottom") return { x: middleX, y: bottomY < 0 ? 0 : bottomY };
  if (position === "left") return { x: MARGIN, y: middleY };
  if (position === "right") return { x: endX, y: middleY };
  if (position === "top-left") return { x: MARGIN, y: MARGIN };
  if (position === "top-right") return { x: endX, y: MARGIN };
  if (position === "bottom-left") return { x: MARGIN, y: bottomY < 0 ? 0 : bottomY };
  if (position === "bottom-right") return { x: endX, y: bottomY < 0 ? 0 : bottomY };

  throw new Error("Initial position invalid");
}
