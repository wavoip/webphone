import { PhoneIcon } from "@phosphor-icons/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { buildAPI } from "@/lib/webphone-api";
import { useSettings, type AppConfig } from "@/providers/SettingsProvider";
import { useTheme } from "@/providers/ThemeProvider";

type Position = { x: number; y: number };

interface WidgetContextType {
  position: Position;
  isDragging: boolean;
  setPosition: (pos: Position) => void;
  startDrag: (e: MouseEvent) => void;
  stopDrag: () => void;
  closed: boolean;
  setClosed: React.Dispatch<React.SetStateAction<boolean>>;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
  config: AppConfig;
};

export function WidgetProvider({ children, config }: Props) {
  const { theme } = useTheme();
  const { showWidgetButton } = useSettings();
  const divRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [closed, setClosed] = useState<boolean>(config.widget?.startOpen || true);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!divRef.current) return;
    let x = e.clientX - offsetRef.current.x;
    let y = e.clientY - offsetRef.current.y;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    if (x > window.innerWidth - divRef.current.getBoundingClientRect().width) {
      x = window.innerWidth - divRef.current.getBoundingClientRect().width;
    }

    if (y > document.body.clientHeight - divRef.current.getBoundingClientRect().height) {
      y = document.body.clientHeight - divRef.current.getBoundingClientRect().height;
    }

    setPosition({ x, y });
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

  useLayoutEffect(() => {
    if (!open || !divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();

    let x = window.innerWidth - rect.width - 24;
    let y = window.innerHeight - rect.height - 24;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    setPosition({ x, y });

    document.addEventListener("mouseleave", stopDrag);

    return () => {
      document.removeEventListener("mouseleave", stopDrag);
    };
  }, [open, stopDrag]);

  useLayoutEffect(() => {
    function handleResize() {
      if (!divRef.current) return;

      const div = divRef.current.getBoundingClientRect();
      let x = null;
      let y = null;

      if (div.x + div.width > window.innerWidth) {
        x = window.innerWidth - divRef.current.getBoundingClientRect().width;
      }

      if (div.y + div.height > window.innerHeight) {
        y = window.innerHeight - divRef.current.getBoundingClientRect().height;
        if (y < 0) y = 0;
      }

      if (x || y) {
        setPosition((position) => ({ x: x || position.x, y: y || position.y }));
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  buildAPI({
    widget: {
      open: () => open(),
      close: () => close(),
      toggle: () => toggle(),
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
        setClosed,
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
          className="wv:data-[closed=false]:hidden wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-green-500 wv:text-white wv:font-bold wv:hover:bg-green-600"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
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
        data-closed={closed}
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
