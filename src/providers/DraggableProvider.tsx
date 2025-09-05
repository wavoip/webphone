import { Button } from "@/components/ui/button";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import React, { createContext, type ReactNode, useCallback, useContext, useState } from "react";

type Position = { x: number; y: number };

interface DraggableContextType {
  position: Position;
  isDragging: boolean;
  setPosition: (pos: Position) => void;
  startDrag: (e: React.MouseEvent) => void;
  stopDrag: () => void;
  close: () => void;
}

const DraggableContext = createContext<DraggableContextType | undefined>(undefined);

export function DraggableProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [closed, setClosed] = useState(false);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const stopDrag = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    },
    [isDragging, offset],
  );

  return (
    <DraggableContext.Provider
      value={{ position, setPosition, startDrag, stopDrag, isDragging, close: () => setClosed(true) }}
    >
      {/** biome-ignore lint/a11y/noStaticElementInteractions: Drag and Drop */}
      <div
        className="w-screen h-screen bg-transparent z-0 text-white flex rounded-lg shadow-lg select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
      >
        {closed ? (
          <Button
            type="button"
            onClick={() => setClosed(false)}
            className="!p-3 rounded-full aspect-square size-fit bg-green-500 text-white font-bold hover:bg-green-600"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 9999,
            }}
          >
            <PhoneIcon className="size-8" />
          </Button>
        ) : (
          children
        )}
      </div>
    </DraggableContext.Provider>
  );
}

export function useDraggable() {
  const ctx = useContext(DraggableContext);
  if (!ctx) throw new Error("useDraggable deve ser usado dentro de <DraggableProvider>");
  return ctx;
}
