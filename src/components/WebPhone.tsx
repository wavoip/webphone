import StatusBar from "@/components/layout/status-bar/StatusBar";

import { Toaster } from "@/components/ui/sonner";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function WebPhone() {
  const { screen } = useScreen();
  const { root, startDrag, stopDrag, close } = useWidget();

  return (
    <>
      <StatusBar />
      <div className="wv:flex wv:flex-1 wv:relative wv:px-7"
        onMouseUp={(e) => {
          stopDrag();
        }}
        onMouseDown={(e) => {
          if (e.target !== e.currentTarget) return;

          document.body.style.userSelect = "unset";
          startDrag(e);
        }}
      >
        <Toaster position="top-right" />
        {screen === "keyboard" && <KeyboardScreen />}
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
      </div>
    </>
  );
}
