import { CallOffers } from "@/components/CallOffers";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useScreen } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

export function Widget() {
  const { screen } = useScreen();

  return (
    <>
      <StatusBar />
      <div className="wv:flex wv:flex-1 wv:relative wv:px-7">
        <CallOffers />
        {screen === "keyboard" && <KeyboardScreen />}
        {/* {screen === "outgoing" && <OutgoingScreen />} */}
        {/* <CallScreen /> */}
        {screen === "outgoing" && <CallScreen />}
        {screen === "call" && <CallScreen />}
      </div>
    </>
  );
}
