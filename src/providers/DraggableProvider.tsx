import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
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

type Position = { x: number; y: number };

interface DraggableContextType {
  root: Element;
  position: Position;
  isDragging: boolean;
  setPosition: (pos: Position) => void;
  startDrag: (e: MouseEvent) => void;
  stopDrag: () => void;
  close: () => void;
  open: () => void;
}

const DraggableContext = createContext<DraggableContextType | undefined>(undefined);

export function DraggableProvider({ children, root }: { children: ReactNode; root: Element }) {
  const [position, setPosition] = useState<Position>({
    x: document.body.clientWidth / 3,
    y: document.body.clientHeight / 3,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [closed, setClosed] = useState(true);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    let x = e.clientX - offsetRef.current.x;
    let y = e.clientY - offsetRef.current.y;

    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    if (x > document.body.clientWidth - 240) {
      x = document.body.clientWidth - 240;
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
      setIsDragging(true);
      offsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      document.addEventListener("mousemove", handleMouseMove);
    },
    [handleMouseMove, position.x, position.y],
  );

  const stopDrag = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
  };

  useEffect(() => {
    function handleResize() {
      setPosition({
        x: document.body.clientWidth / 3,
        y: document.body.clientHeight / 3,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DraggableContext.Provider
      value={{
        root,
        position,
        setPosition,
        startDrag,
        stopDrag,
        isDragging,
        close: () => {
          if (!closed) setClosed(true);
        },
        open: () => {
          if (closed) setClosed(false);
        },
      }}
    >
      <Button
        type="button"
        onClick={() => setClosed(false)}
        size={"icon"}
        data-closed={closed}
        className="wv:data-[closed=false]:hidden wv:absolute wv:bottom-0 wv:right-0 wv:p-3 wv:rounded-full wv:aspect-square wv:size-fit wv:bg-green-500 wv:text-white wv:font-bold wv:hover:bg-green-600"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
        }}
      >
        <PhoneIcon className="wv:size-8" />
      </Button>
      <div
        data-closed={closed}
        className="wv:data-[closed=true]:hidden wv:absolute wv:flex wv:flex-col wv:w-60 wv:h-120 wv:rounded-2xl wv:bg-background wv:shadow-lg"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {children}
      </div>
    </DraggableContext.Provider>
  );
}

export function useDraggable() {
  const ctx = useContext(DraggableContext);
  if (!ctx) throw new Error("useDraggable deve ser usado dentro de <DraggableProvider>");
  return ctx;
}
