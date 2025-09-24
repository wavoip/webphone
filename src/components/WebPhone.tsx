import StatusBar from "@/components/layout/status-bar/StatusBar";
import { Toaster } from "@/components/ui/sonner";
import { useScreen } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function WebPhone() {
  const { screen } = useScreen();

  return (
    <>
      <StatusBar />
      <div className="wv:flex wv:flex-1 wv:relative wv:px-7">
        <Toaster position="top-center" />
        {screen === "keyboard" && <KeyboardScreen />}
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
      </div>
    </>
  );
}
