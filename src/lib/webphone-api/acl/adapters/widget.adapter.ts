import { bus } from "@/lib/webphone-api/bus";
import type { WidgetButtonPosition } from "@/providers/settings/settings";

type Position = { x: number; y: number };

type WidgetAdapterConfig = {
  startOpen?: boolean;
};

const BUTTON_MARGIN = 20;
const BUTTON_SIZE = { width: 56, height: 56 };

function resolveButtonPosition(raw: WidgetButtonPosition): Position {
  if (typeof raw === "object") return raw;

  const endX = window.innerWidth - BUTTON_MARGIN - BUTTON_SIZE.width;
  const endY = window.innerHeight - BUTTON_MARGIN - BUTTON_SIZE.height;

  if (raw === "top-right") return { x: endX, y: BUTTON_MARGIN };
  if (raw === "top-left") return { x: BUTTON_MARGIN, y: BUTTON_MARGIN };
  if (raw === "bottom-left") return { x: BUTTON_MARGIN, y: endY < 0 ? 0 : endY };
  if (raw === "bottom-right") return { x: endX, y: endY < 0 ? 0 : endY };

  throw new Error(
    `resolveButtonPosition: invalid value ${JSON.stringify(raw)}. Expected one of top-left/top-right/bottom-left/bottom-right or {x, y}.`,
  );
}

export function bootWidgetAdapter({ startOpen = false }: WidgetAdapterConfig = {}): () => void {
  let isOpen = startOpen;
  let position: Position = { x: 0, y: 0 };
  let buttonPosition: Position = { x: 0, y: 0 };

  const unsubs: Array<() => void> = [
    bus.registerQuery("widget.isOpen", () => isOpen),
    bus.registerQuery("widget.buttonPosition", () => buttonPosition),
    bus.registerQuery("position.value", () => position),

    bus.handle("widget.setIsClosed", async ({ isClosed }) => {
      const next = !isClosed;
      if (next === isOpen) return;
      isOpen = next;
      bus.emit("widget.changed", { isOpen });
    }),
    bus.handle("widget.open", async () => {
      if (isOpen) return;
      isOpen = true;
      bus.emit("widget.changed", { isOpen });
    }),
    bus.handle("widget.close", async () => {
      if (!isOpen) return;
      isOpen = false;
      bus.emit("widget.changed", { isOpen });
    }),
    bus.handle("widget.toggle", async () => {
      isOpen = !isOpen;
      bus.emit("widget.changed", { isOpen });
    }),
    bus.handle("widget.buttonPosition.set", async ({ value }) => {
      buttonPosition = resolveButtonPosition(value);
      bus.emit("widget.buttonPosition.changed", buttonPosition);
    }),
    bus.handle("position.set", async ({ value }) => {
      position = value;
      bus.emit("position.changed", value);
    }),
  ];

  bus.emit("widget.changed", { isOpen });

  return () => {
    for (const u of unsubs.reverse()) u();
  };
}
