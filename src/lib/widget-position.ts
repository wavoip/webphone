import type { WebphonePosition, WidgetButtonPosition } from "@/providers/settings/settings";

const MARGIN_WIDGET = 24;
const MARGIN_BUTTON = 20;
const BUTTON_SIZE = { width: 56, height: 56 };

// w-70 h-120 do container, para quando ainda não há DOM para medir (ex.:
// `window.wavoip.position.set("center")` antes do layout).
const WIDGET_FALLBACK_SIZE = { width: 280, height: 480 };

export function resolveWebphonePosition(
  position: WebphonePosition,
  widgetSize: { width: number; height: number } = WIDGET_FALLBACK_SIZE,
): { x: number; y: number } {
  if (typeof position === "object") return position;

  const middleY = window.innerHeight / 2 - widgetSize.height / 2;
  const bottomY = window.innerHeight - MARGIN_WIDGET - widgetSize.height;
  const middleX = window.innerWidth / 2 - widgetSize.width / 2;
  const endX = window.innerWidth - MARGIN_WIDGET - widgetSize.width;

  switch (position) {
    case "top":
      return { x: middleX, y: MARGIN_WIDGET };
    case "bottom":
      return { x: middleX, y: bottomY < 0 ? 0 : bottomY };
    case "left":
      return { x: MARGIN_WIDGET, y: middleY };
    case "right":
      return { x: endX, y: middleY };
    case "center":
      return { x: middleX, y: middleY };
    case "top-left":
      return { x: MARGIN_WIDGET, y: MARGIN_WIDGET };
    case "top-right":
      return { x: endX, y: MARGIN_WIDGET };
    case "bottom-left":
      return { x: MARGIN_WIDGET, y: bottomY < 0 ? 0 : bottomY };
    case "bottom-right":
      return { x: endX, y: bottomY < 0 ? 0 : bottomY };
    default: {
      throw new Error(`Invalid WebphonePosition: ${JSON.stringify(position)}`);
    }
  }
}

export function resolveWidgetButtonPosition(position: WidgetButtonPosition): { x: number; y: number } {
  if (typeof position === "object") return position;

  const endX = window.innerWidth - MARGIN_BUTTON - BUTTON_SIZE.width;
  const endY = window.innerHeight - MARGIN_BUTTON - BUTTON_SIZE.height;

  switch (position) {
    case "top-right":
      return { x: endX, y: MARGIN_BUTTON };
    case "top-left":
      return { x: MARGIN_BUTTON, y: MARGIN_BUTTON };
    case "bottom-left":
      return { x: MARGIN_BUTTON, y: endY < 0 ? 0 : endY };
    case "bottom-right":
      return { x: endX, y: endY < 0 ? 0 : endY };
    default: {
      throw new Error(`Invalid WidgetButtonPosition: ${JSON.stringify(position)}`);
    }
  }
}
