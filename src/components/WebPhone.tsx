import { useCallback } from "react";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";
import pkg from "../../package.json";


interface WebPhoneProps {
  onPipClick: () => void;
  isPip: boolean;
}

export function WebPhone({ onPipClick, isPip }: WebPhoneProps) {
  const { screen } = useScreen();
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

      <StatusBar onPipClick={onPipClick} isPip={isPip} />

      <div
        role="application"
        className="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
        {screen === "keyboard" && <KeyboardScreen onPipClick={onPipClick} />}

        <p className="wv:text-neutral-500 pointer-events-none wv:absolute wv:bottom-1 wv:left-2 wv:select-none wv:z-50 wv:text-[12px]" aria-hidden="true">
          v {pkg.version}
        </p>
      </div>
    </>
  );
}