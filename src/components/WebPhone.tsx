import { useCallback, useEffect, useRef } from "react";
import { useStore } from "zustand";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { PipPortal } from "@/components/PipPortal";
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
  const { pipWindow, pipContent, setPipContent } = usePip();
  const resolvedTheme = root.classList.contains("dark") ? "dark" : "light";

  const prevScreenRef = useRef(screen);

  useEffect(() => {
    if (screen === "keyboard" && prevScreenRef.current !== "keyboard" && pipWindow) {
      pipWindow.close();
    }
    prevScreenRef.current = screen;
  }, [screen, pipWindow]);

  useEffect(() => {
    setPipContent(screen === "keyboard" ? "keyboard" : "call");
  }, [screen, setPipContent]);

  useEffect(() => {
    setIsClosed(!!pipWindow);
  }, [pipWindow, setIsClosed]);

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
      {<StatusBar />}
      <div
        role="application"
        className="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={stopDrag}
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

      {pipWindow && (
        <PipPortal pipWindow={pipWindow} theme={resolvedTheme}>
          {pipContent === "keyboard" ? (
            <KeyboardScreen compact />
          ) : screen === "call" ? (
            <CallScreen />
          ) : (
            <OutgoingScreen />
          )}
        </PipPortal>
      )}
    </>
  );
}
