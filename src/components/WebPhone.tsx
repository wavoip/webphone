import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useStore } from "zustand";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useMiddleware } from "@/middleware/react/hooks";
import { usePip } from "@/providers/PipProvider";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function WebPhone() {
  const middleware = useMiddleware();
  const screen = useStore(middleware.store, (s) => s.screen);
  const { startDrag, stopDrag, setIsClosed } = useWidget();
  const { root } = useShadowRoot();
  const { pipWindow, isPipActive } = usePip();
  const resolvedTheme = root.classList.contains("dark") ? "dark" : "light";

  const prevScreenRef = useRef(screen);

  useEffect(() => {
    if (screen === "keyboard" && prevScreenRef.current !== "keyboard" && pipWindow) {
      pipWindow.close();
    }
    prevScreenRef.current = screen;
  }, [screen, pipWindow]);

  useEffect(() => {
    setIsClosed(isPipActive);
  }, [isPipActive, setIsClosed]);

  const handleMouseUp = useCallback(() => stopDrag(), [stopDrag]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      document.body.style.userSelect = "unset";
      startDrag(e);
    },
    [startDrag],
  );

  const callScreens = (
    <>
      {screen === "outgoing" && <OutgoingScreen />}
      {screen === "call" && <CallScreen />}
    </>
  );

  return (
    <>
      {!isPipActive && <StatusBar />}
      <div
        role="application"
        className="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        {screen === "keyboard" && <KeyboardScreen />}
        {!pipWindow && callScreens}

        <p
          className="wv:text-neutral-500 pointer-events-none wv:absolute wv:bottom-1 wv:left-2 wv:select-none wv:z-50 wv:text-[12px]"
          aria-hidden="true"
        >
          v {__WEBPHONE_VERSION__}
        </p>
      </div>

      {pipWindow &&
        createPortal(
          <div
            className={`wv:fixed wv:inset-0 wv:flex wv:flex-col wv:items-center wv:justify-center wv:bg-background wv:overflow-hidden wv:m-0 wv:p-0 ${resolvedTheme}`}
          >
            <div className="wv:h-full wv:w-full wv:flex wv:flex-col">
              {screen === "keyboard" ? <OutgoingScreen /> : callScreens}
            </div>
          </div>,
          pipWindow.document.body,
        )}
    </>
  );
}
