import { bus } from "@/lib/webphone-api/bus";

type Position = { x: number; y: number };

type WidgetAdapterConfig = {
  startOpen?: boolean;
};

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
      buttonPosition = value;
      bus.emit("widget.buttonPosition.changed", value);
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
