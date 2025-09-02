import {
  ArrowsOutCardinalIcon,
  EyeClosedIcon,
  WifiHighIcon,
  WifiLowIcon,
  WifiMediumIcon,
  WifiNoneIcon,
  WifiSlashIcon,
} from "@phosphor-icons/react";
import { useDraggable } from "../../providers/DraggableProvider";
import { usePhone } from "../../providers/ScreenProvider";

export default function StatusBar() {
  const { startDrag } = useDraggable();
  const { setScreen } = usePhone();

  return (
    <div className="w-60 h-6 rounded-2xl rounded-b-none bg-green-900 flex flex-row justify-between shadow-lg px-2">
      {true && <WifiHighIcon size={24} />}
      {false && <WifiMediumIcon size={24} />}
      {false && <WifiLowIcon size={24} />}
      {false && <WifiNoneIcon size={24} />}
      {false && <WifiSlashIcon size={24} />}
      <p>DeviceStat</p>
      <div>
        <button type="button" onMouseDown={startDrag} className="active:bg-green-800 rounded-2xl">
          <ArrowsOutCardinalIcon size={24} />
        </button>
        <button type="button" onClick={() => setScreen("closed")}>
          <EyeClosedIcon size={24} />
        </button>
      </div>
    </div>
  );
}
