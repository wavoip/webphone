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
    <div className="flex flex-col size-full items-center justify-evenly px-6">
      <div className="text-center">
        <Input
          placeholder="Digite..."
          value={number}
          onChange={(e) => {
            const numbers = e.target.value.match(/\d+/g);
            if (numbers?.length) {
              setNumber(numbers.join(""));
            }
          }}
          className="border-b-2 border-l-0 border-r-0 border-t-0 shadow-none rounded-none text-xl text-foreground text-center focus-visible:ring-0"
        />
      </div>

      <div className="grid grid-cols-3 grid-rows-4 w-full gap-3">
        {buttons.map(([num, letters]) => (
          <Button
            key={num}
            type="button"
            variant={"secondary"}
            className="aspect-square size-full rounded-full hover:bg-muted-foreground hover:text-background hover:cursor-pointer text-foreground flex flex-col justify-center items-center gap-0"
            onClick={() => handleClick(num)}
          >
            <p className="text-lg font-bold">{num}</p>
            {!!letters && <p className="text-xs font-light text-muted-400">{letters}</p>}
          </Button>
        ))}
      </div>

      <div className="w-full flex justify-evenly justify-items-center">
        <Button
          type="button"
          variant={"secondary"}
          onClick={handleDelete}
          className="size-fit aspect-square !p-2 hover:bg-muted-foreground hover:text-background text-foreground hover:cursor-pointer"
        >
          <BackspaceIcon className="size-6" />
        </Button>
        <Button
          type="button"
          size={"icon"}
          className="text-background size-fit aspect-square p-2 bg-green-500 hover:bg-green-700 hover:cursor-pointer"
          onClick={() => makeCall(number)}
        >
          <PhoneIcon className="size-6" />
        </Button>
      </div>
    </div>
  );
}
