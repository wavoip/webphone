import { CallOffers } from "@/components/CallOffers";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useDraggable } from "@/providers/DraggableProvider";
import { usePhone } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";
import QrcodeScreen from "@/screens/QrcodeScreen";

export default function PhoneWidget() {
  const { screen, setScreen } = usePhone();
  const { position } = useDraggable();

  return (
    <div>
      {screen !== "closed" && (
        <div
          className="w-60 h-120 rounded-2xl bg-background shadow-lg"
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
          }}
        >
          <StatusBar />
          <div className="size-full relative">
            <CallOffers />
            {screen === "keyboard" && <KeyboardScreen />}
            {screen === "outgoing" && <OutgoingScreen />}
            {screen === "call" && <CallScreen />}
            {screen === "login" && <QrcodeScreen />}
          </div>
        </div>
      )}

      {screen === "closed" && (
        <button
          type="button"
          onClick={() => setScreen("keyboard")}
          className="p-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          Webphone
        </button>
      )}
    </div>
  );
}
