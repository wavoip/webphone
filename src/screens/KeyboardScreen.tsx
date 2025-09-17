import { BackspaceIcon, PhoneIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWavoip } from "@/providers/WavoipProvider";

export default function KeyboardScreen() {
  const { makeCall } = useWavoip();

  const [number, setNumber] = useState("");

  const handleClick = (value: string) => {
    setNumber((prev) => prev + value);
  };

  const handleDelete = () => {
    setNumber((prev) => prev.slice(0, -1));
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
    <div className="wv:flex wv:flex-col wv:size-full wv:items-center wv:justify-evenly wv:px-6">
      <div className="wv:text-center">
        <Input
          placeholder="Digite..."
          value={number}
          onChange={(e) => {
            const numbers = e.target.value.match(/\d+/g);
            if (numbers?.length) {
              setNumber(numbers.join(""));
            }
          }}
          className="wv:border-b-2 wv:border-l-0 wv:border-r-0 wv:border-t-0 wv:shadow-none wv:rounded-none wv:text-xl wv:text-foreground wv:text-center wv:focus-visible:ring-0"
        />
      </div>

      <div className="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-3">
        {buttons.map(([num, letters]) => (
          <Button
            key={`webphone-keyboard-${num}`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
            onClick={() => handleClick(num)}
          >
            <p className="wv:text-lg wv:font-bold">{num}</p>
            {!!letters && <p className="wv:text-xs wv:font-light wv:text-muted-400">{letters}</p>}
          </Button>
        ))}
      </div>

      <div className="wv:w-full wv:flex wv:justify-evenly wv:justify-items-center">
        <Button
          type="button"
          variant={"secondary"}
          size={"icon"}
          onClick={handleDelete}
          className="wv:aspect-square wv:size-fit wv:p-2 wv:hover:bg-muted-foreground wv:hover:text-background wv:text-foreground wv:hover:cursor-pointer"
        >
          <BackspaceIcon className="wv:size-6" />
        </Button>
        <Button
          type="button"
          size={"icon"}
          className="wv:text-background wv:size-fit wv:aspect-square wv:p-2 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer"
          onClick={() => makeCall(number)}
        >
          <PhoneIcon className="wv:size-6" />
        </Button>
      </div>
    </div>
  );
}
