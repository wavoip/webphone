import { usePhone } from "../providers/ScreenProvider";
import { useWavoip } from "../providers/WavoipProvider";

export default function QrcodeScreen() {
  const { wavoipInstance } = useWavoip();
  const { setScreen } = usePhone();

  const devices = wavoipInstance.getDevices();

  return (
    <div className="w-60 h-120 rounded-2xl bg-green-950 flex flex-col shadow-lg">
      {devices.map((device, index) => (
        <div key={device.token} className="flex flex-row h-15 mt-2">
          <p>{device.status || `Device ${index + 1}`}</p>
        </div>
      ))}
      <button
        type="button"
        className="m-2 p-2 bg-green-900 rounded-lg text-white"
        onClick={() => setScreen("keyboard")}
      >
        back
      </button>
      <div className="flex flex-row h-15 mt-2"></div>
    </div>
  );
}
