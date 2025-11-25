import { useCallback } from "react";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function WebPhone() {
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
      <StatusBar />
      <div role="application" className="wv:flex wv:flex-1 wv:relative wv:px-7" onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
        {screen === "keyboard" && <KeyboardScreen />}
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
      </div>
    </>
  );
}
