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
import { mergeToAPI } from "@/lib/webphone-api";
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
  setIsClosed: React.Dispatch<React.SetStateAction<boolean>>;
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
  const { widget, position: positionInitial, buttonPosition: buttonPositionInitial } = useSettings();

  const [showWidget, setShowWidget] = useState(widget.show);

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isClosed, setIsClosed] = useState<boolean>(!widget.startOpen);

  const divRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

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
    if (isClosed) setIsClosed(false);
  }, [isClosed]);

  const close = useCallback(() => {
    if (!isClosed) setIsClosed(true);
  }, [isClosed]);

  const toggle = useCallback(() => {
    setIsClosed((prev) => !prev);
  }, []);

  useLayoutEffect(() => {
    if (!open || !divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();

    let x = window.innerWidth - rect.width - 24;
    let y = window.innerHeight - rect.height - 24;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    setPosition(handlePositionInitialSettings(positionInitial, divRef as RefObject<HTMLDivElement>));
    setButtonPosition(handleButtonPositionInitialSettings(buttonPositionInitial));

    document.addEventListener("mouseleave", stopDrag);

    return () => {
      document.removeEventListener("mouseleave", stopDrag);
    };
  }, [open, stopDrag, positionInitial, buttonPositionInitial]);

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

  useEffect(() => {
    mergeToAPI({
      widget: {
        isOpen: !isClosed,
        open: () => open(),
        close: () => close(),
        toggle: () => toggle(),
      },
      settings: {
        showWidgetButton: showWidget,
        setShowWidgetButton: (...args) => setShowWidget(...args),
      },
      position: {
        value: position,
        set: (...args) => setPosition(handlePositionInitialSettings(...args, divRef as RefObject<HTMLDivElement>)),
      },
      buttonPosition: {
        value: buttonPosition,
        set: (...args) => setButtonPosition(handleButtonPositionInitialSettings(...args)),
      },
    });
  }, [open, close, toggle, showWidget, position, buttonPosition, isClosed]);

  return (
    <WidgetContext.Provider
      value={{
        position,
        buttonPosition,
        setPosition,
        startDrag,
        stopDrag,
        isDragging,
        isClosed: isClosed,
        setIsClosed: setIsClosed,
        close: () => {
          if (!isClosed) setIsClosed(true);
        },
        open: () => {
          if (isClosed) setIsClosed(false);
        },
        toggle: () => {
          setIsClosed((prev) => !prev);
        },
      }}
    >
      {showWidget && (
        <Button
          type="button"
          onClick={() => setIsClosed(false)}
          size={"icon"}
          data-closed={isClosed}
          className="wv:data-[closed=false]:hidden wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-green-500 wv:text-white wv:font-bold wv:hover:bg-green-600"
          style={{
            position: "fixed",
            bottom: buttonPosition.y || "20px",
            right: buttonPosition.x || "20px",
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
  if (position === "bottom") return { x: middleX, y: bottomY };
  if (position === "left") return { x: MARGIN, y: middleY };
  if (position === "right") return { x: endX, y: middleY };
  if (position === "top-left") return { x: MARGIN, y: MARGIN };
  if (position === "top-right") return { x: endX, y: MARGIN };
  if (position === "bottom-left") return { x: MARGIN, y: bottomY };
  if (position === "bottom-right") return { x: endX, y: bottomY };

  throw new Error("Initial position invalid");
}

function handleButtonPositionInitialSettings(
  position: WidgetButtonPosition,
): { x: number; y: number } {
  if (typeof position === "object") {
    return position;
  }

  if (position === "bottom-right") return { x: 20, y: 20 };
  if (position === "bottom-left") return { x: window.innerWidth - 76, y: 20 };

  throw new Error("Initial button position invalid");
}
