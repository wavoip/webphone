import { useDraggable } from "../providers/DraggableProvider";
import { usePhone } from "../providers/ScreenProvider";
import CallScreen from "./CallScreen";
import IncomingScreen from "./IncomingScreen";
import KeyboardScreen from "./KeyboardScreen";
import OutgoingScreen from "./OutgoingScreen";
import QrcodeScreen from "./QrcodeScreen";

export default function PhoneWidget() {
  const { screen, setScreen } = usePhone();
  const { position } = useDraggable();

  return (
    <>
      {screen !== "closed" && (
        <div
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
          }}
        >
          {screen === "keyboard" && <KeyboardScreen />}
          {screen === "outgoing" && <OutgoingScreen />}
          {screen === "incoming" && <IncomingScreen />}
          {screen === "call" && <CallScreen />}
          {screen === "qrcode" && <QrcodeScreen />}
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
    </>
  );
}
