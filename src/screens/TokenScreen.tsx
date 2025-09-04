import { useState } from "react";
import { Wavoip } from "wavoip-api";
import { useDraggable } from "@/providers/DraggableProvider";
import StatusBar from "../components/ui/StatusBar";
import { usePhone } from "../providers/ScreenProvider";

type Props = {
  setWavoip: React.Dispatch<React.SetStateAction<Wavoip | null>>;
};

export default function TokenScreen({ setWavoip }: Props) {
  const { setScreen, setTokens, tokens } = usePhone();
  const [input, setInput] = useState("");
  const { position } = useDraggable();

  const createInstance = () => {
    setWavoip(new Wavoip({ tokens }));
    setScreen("qrcode");
  };

  return (
    <div
      className="w-60 h-120 rounded-2xl bg-green-950 flex flex-col shadow-lg"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <StatusBar />
      <div className="p-2 flex flex-col justify-center items-center">
        <label className="font-semibold ">
          Adicionar token:
          <input
            type="text"
            className="bg-white rounded-2xl border-2 border-gray-400 w-56 text-black pl-2 pr-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => setTokens((prev) => [...prev, input])}
          className="bg-green-400 rounded-2xl text-black w-25 h-8 mt-2 font-semibold"
        >
          Adicionar
        </button>
      </div>
      <div className="max-h-72 overflow-auto pl-2 pr-2">
        {tokens &&
          tokens.length > 0 &&
          tokens.map((token) => (
            <p className="font-semibold p-2 bg-gray-500 mt-1" key={token}>
              {token}
            </p>
          ))}
      </div>
      <button
        type="button"
        className="m-2 bg-green-900 rounded-lg text-white font-semibold h-10"
        onClick={createInstance}
      >
        Próximo
      </button>
    </div>
  );
}
