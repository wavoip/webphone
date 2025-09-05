import { CallOffers } from "@/components/CallOffers";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useDraggable } from "@/providers/DraggableProvider";
import { useScreen } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import { DevicesScreen } from "@/screens/devices/DevicesScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export default function PhoneWidget() {
  const { screen } = useScreen();
  const { position } = useDraggable();

  return (
    <div
      className="flex flex-col w-60 h-120 rounded-2xl bg-background shadow-lg"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <StatusBar />
      <div className="flex flex-1 relative">
        <CallOffers />
        {screen === "keyboard" && <KeyboardScreen />}
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
        {screen === "devices" && <DevicesScreen />}
      </div>
    </div>
  );
}
