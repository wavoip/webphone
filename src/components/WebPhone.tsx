import { useCallback } from "react";
import { useStore } from "zustand";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useMiddleware } from "@/middleware/react/hooks";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";
import pkg from "../../package.json";

export function WebPhone() {
  const middleware = useMiddleware();
  const screen = useStore(middleware.store, (s) => s.screen);
  const { startDrag, stopDrag } = useWidget();

  const handleMouseUp = useCallback(() => {
    stopDrag();
  }, [stopDrag]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      document.body.style.userSelect = "unset";
      startDrag(e);
    },
    [startDrag],
  );

  return (
    <>
      <StatusBar />

      <div
        role="application"
        className="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
        {screen === "keyboard" && <KeyboardScreen />}

        <p
          className="wv:text-neutral-500 pointer-events-none wv:absolute wv:bottom-1 wv:left-2 wv:select-none wv:z-50 wv:text-[12px]"
          aria-hidden="true"
        >
          v {pkg.version}
        </p>
      </div>
    </>
  );
}
