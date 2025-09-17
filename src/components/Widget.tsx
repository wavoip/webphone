import { CallOffers } from "@/components/CallOffers";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { useDraggable } from "@/providers/DraggableProvider";
import { useScreen } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";

type Props = {
  root: Element;
};

export function Widget({ root }: Props) {
  const { screen } = useScreen();
  const { position, handleMouseMove } = useDraggable();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag
    <div
      onMouseMove={handleMouseMove}
      className="wv:absolute wv:z-[99999999] wv:flex wv:flex-col wv:w-60 wv:h-120 wv:rounded-2xl wv:bg-background wv:shadow-lg"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <StatusBar root={root} />
      <div className="wv:flex wv:flex-1 wv:relative">
        <CallOffers />
        {screen === "keyboard" && <KeyboardScreen />}
        {screen === "outgoing" && <OutgoingScreen />}
        {screen === "call" && <CallScreen />}
      </div>
    </div>
  );
}
