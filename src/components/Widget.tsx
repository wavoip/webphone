import { CallOffers } from "@/components/CallOffers";
import StatusBar from "@/components/layout/status-bar/StatusBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScreen } from "@/providers/ScreenProvider";
import CallScreen from "@/screens/CallScreen";
import IncomingScreen from "@/screens/IncomingScreen";
import KeyboardScreen from "@/screens/KeyboardScreen";
import OutgoingScreen from "@/screens/OutgoingScreen";
import { useEffect } from "react";
import { toast } from "sonner";

export function Widget() {
  const { screen } = useScreen();

  useEffect(() => {
    setTimeout(() => {
      toast(<IncomingScreen />, {
        duration: 100000
      });
      toast(<IncomingScreen />, {
        duration: 100000
      });
      toast(<IncomingScreen />, {
        duration: 100000
      });
    }, 2000);


  }, []);

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
