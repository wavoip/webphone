import Keyboard from "../components/ui/Keyboard";
import StatusBar from "../components/ui/StatusBar";
import { useWavoip } from "../providers/WavoipProvider";

export default function KeyboardScreen() {
  const { offers } = useWavoip();

  return (
    <div className="w-60 h-120 rounded-2xl bg-green-950 flex flex-col shadow-lg">
      <StatusBar />
      <Keyboard />
    </div>
  );
}
