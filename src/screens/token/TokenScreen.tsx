import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDraggable } from "@/providers/DraggableProvider";
import StatusBar from "@/screens/token/components/StatusBar";

export default function TokenScreen() {
  const { position } = useDraggable();

  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);

  return (
    <div
      className="flex flex-col w-60 h-120 rounded-2xl bg-background shadow-lg"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <StatusBar />
      <div className="flex-grow flex flex-col items-center gap-2 p-2">
        <p className="text-xl text-foreground">Tokens</p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="text-foreground focus-visible:ring-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => {
              setTokens((prev) => [...prev, input]);
              setInput("");
            }}
          >
            <PlusIcon weight="bold" />
          </Button>
        </div>
        <div className="basis-0 flex-1 overflow-auto flex flex-col w-full gap-1">
          {tokens.map((token) => (
            <div key={token} className="flex justify-between items-center gap-2 p-2 bg-muted rounded-md">
              <p className="text-foreground text-sm truncate">{token}</p>
              <Button
                variant={"destructive"}
                className="size-fit !p-1.5 aspect-square hover:cursor-pointer"
                onClick={() => setTokens(tokens.filter((t) => t !== token))}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
