import { useCallback, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useMiddleware } from "@/middleware/react/hooks";
import { SelectedDeviceProvider, useSelectedDevice } from "@/providers/SelectedDeviceProvider";
import { useWavoip } from "@/providers/WavoipProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";
import StatusBar from "@/components/layout/status-bar/StatusBar";

function DeviceValidator() {
  const { devices } = useWavoip();
  const { selectedToken, setSelectedToken } = useSelectedDevice();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!selectedToken || resolvedRef.current) return;

    const found = devices.some((d) => d.token === selectedToken);
    if (found) {
      resolvedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setSelectedToken(null);
        resolvedRef.current = true;
      }, 10_000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [devices, selectedToken, setSelectedToken]);

  return null;
}

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
    <SelectedDeviceProvider>
      <DeviceValidator />
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
          v {__WEBPHONE_VERSION__}
        </p>
      </div>
    </SelectedDeviceProvider>
  );
}
