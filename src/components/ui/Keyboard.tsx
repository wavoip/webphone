import { BackspaceIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { usePhone } from "../../providers/ScreenProvider";
import { useWavoip } from "../../providers/WavoipProvider";
import CallButton from "./CallButton";

export default function Keyboard() {
  const [number, setNumber] = useState("");
  const { setScreen } = usePhone();
  const { wavoipInstance } = useWavoip();

  const handleClick = (value: string) => {
    setNumber((prev) => prev + value);
  };

  const handleDelete = () => {
    setNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = (number: string) => {
    console.log(wavoipInstance.getDevices()[0].token);
    wavoipInstance.startCall({ fromTokens: [wavoipInstance.getDevices()[0].token], to: number });
  };

  const buttons = [
    ["1", ""],
    ["2", "ABC"],
    ["3", "DEF"],
    ["4", "GHI"],
    ["5", "JKL"],
    ["6", "MNO"],
    ["7", "PQRS"],
    ["8", "TUV"],
    ["9", "WXYZ"],
    ["*", ""],
    ["0", "+"],
    ["#", ""],
  ];

  return (
    <div className="w-full h-100 mx-auto p-4 rounded-2xl">
      {/* Campo onde aparece o número */}
      <div className="text-center mb-4">
        <div className="text-foreground text-2xl font-mono tracking-wide h-15 flex items-center justify-center border-b border-gray-300">
          {number || <span className="text-gray-500">Digite...</span>}
        </div>
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-3">
        {buttons.map(([num, letters]) => (
          <button
            type="button"
            key={num}
            onClick={() => handleClick(num)}
            className="flex flex-col items-center justify-center p-2 bg-green-900 rounded-full shadow active:bg-gray-200"
          >
            <span className="text-xl font-bold">{num}</span>
            <span className="text-sm text-gray-400">{letters}</span>
          </button>
        ))}
      </div>

      {/* Ações */}
      <div className="flex justify-center items-center gap-6 mt-2">
        <button
          type="button"
          onClick={handleDelete}
          className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          <BackspaceIcon size={32} />
        </button>
        <CallButton num={number} />
        <button
          onClick={() => {
            setScreen("login");
            handleCall(number);
          }}
          type="button"
          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          in
        </button>
      </div>
    </div>
  );
}
