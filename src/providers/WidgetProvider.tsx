import { PhoneIcon } from "@phosphor-icons/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { buildAPI } from "@/lib/webphone-api";
import { useTheme } from "@/providers/ThemeProvider";
import { useSettings } from "@/providers/SettingsProvider";

type Position = { x: number; y: number };

interface WidgetContextType {
  position: Position;
  isDragging: boolean;
  setPosition: (pos: Position) => void;
  startDrag: (e: MouseEvent) => void;
  stopDrag: () => void;
  closed: boolean;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const { showWidgetButton } = useSettings();

  const [position, setPosition] = useState<Position>({
    x: document.body.clientWidth / 3,
    y: document.body.clientHeight / 3,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [closed, setClosed] = useState(true);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    let x = e.clientX - offsetRef.current.x;
    let y = e.clientY - offsetRef.current.y;

    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    if (x > document.body.clientWidth - 280) {
      x = document.body.clientWidth - 280;
    }
    if (y > document.body.clientHeight - 480) {
      y = document.body.clientHeight - 480;
    }

    setPosition({
      x: x,
      y: y,
    });
  }, []);

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

  const open = useCallback(() => {
    if (closed) setClosed(false);
  }, [closed]);

  const close = useCallback(() => {
    if (!closed) setClosed(true);
  }, [closed]);

  const toggle = useCallback(() => {
    setClosed((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleResize() {
      setPosition({
        x: document.body.clientWidth / 3,
        y: document.body.clientHeight / 3,
      });
    }

    document.addEventListener("mouseleave", () => {
      stopDrag(); // encerra o drag
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [stopDrag]);

  buildAPI({
    widget: {
      open: open,
      close: close,
      toggle: toggle,
    },
  });

  return (
    <WidgetContext.Provider
      value={{
        position,
        setPosition,
        startDrag,
        stopDrag,
        isDragging,
        closed,
        close: () => {
          if (!closed) setClosed(true);
        },
        open: () => {
          if (closed) setClosed(false);
        },
        toggle: () => {
          setClosed((prev) => !prev);
        },
      }}
    >
      {showWidgetButton && (
        <Button
          type="button"
          onClick={() => setClosed(false)}
          size={"icon"}
          data-closed={closed}
          className="wv:data-[closed=false]:hidden wv: wv:absolute sm:wv:fixed wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-green-500 wv:text-white wv:font-bold wv:hover:bg-green-600"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
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
        data-closed={closed}
        className="wv:data-[closed=true]:hidden wv:absolute wv:flex wv:flex-col  wv:w-70 wv:h-120 wv:rounded-2xl  wv:max-sm:fixed  wv:max-sm:w-dvw wv:max-sm:h-dvh wv:max-sm:!left-[0px] wv:max-sm:!top-[0px] wv:bg-background wv:shadow-lg wv:touch-manipulation"
        style={{
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
