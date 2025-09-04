import { useState } from "react";
import QRCode from "react-qr-code";
import type { Device } from "wavoip-api";
import { useWavoip } from "@/providers/WavoipProvider";
import StatusBar from "../components/ui/StatusBar";
import { usePhone } from "../providers/ScreenProvider";

type Props = {
  device: Device;
};

function DeviceComponent({ device }: Props) {
  const [qrcode, setQrcode] = useState(device.qrcode);
  const [status, setStatus] = useState(device.status);

  device.onQRCode((qrcode) => {
    setQrcode(qrcode);
  });

  device.onStatus((status) => {
    setStatus(status);
  });

  return (
    <div className="flex flex-col items-center bg-green-200 text-black p-2 rounded-2xl font-semibold mb-2">
      <p>Dispositivo: {device.token.split("-")[0]}</p>
      <p>Status: {status}</p>
      {(status === "connecting" || status === "DISCONNECTED" || status === "close") && qrcode && (
        <QRCode value={qrcode} size={150} level="L"></QRCode>
      )}
      {status === "open" && <p>Pronto para uso</p>}
    </div>
  );
}

export default function QrcodeScreen() {
  const { setScreen } = usePhone();
  const { wavoipInstance } = useWavoip();
  const devices = wavoipInstance.getDevices();

  return (
    <div className="w-60 h-120 rounded-2xl bg-green-950 flex flex-col shadow-lg">
      <StatusBar />
      <div className="p-2 flex flex-col items-center h-100 overflow-auto">
        {devices.map((device) => (
          <div key={device.token}>
            <DeviceComponent device={device} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="m-2 bg-green-900 rounded-lg text-white font-semibold h-10"
        onClick={() => setScreen("keyboard")}
      >
        entrar
      </button>
    </div>
  );
}
