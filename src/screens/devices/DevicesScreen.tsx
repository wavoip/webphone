import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWavoip } from "@/providers/WavoipProvider";
import { DeviceInfo } from "@/screens/devices/components/DeviceInfo";

export function DevicesScreen() {
  const { devices, addDevice } = useWavoip();

  const [input, setInput] = useState("");

  return (
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
            addDevice(input);
            setInput("");
          }}
        >
          <PlusIcon weight="bold" />
        </Button>
      </div>
      <div className="basis-0 flex-1 overflow-auto flex flex-col w-full gap-1">
        {devices.map((device) => (
          <DeviceInfo key={device.token} device={device} />
        ))}
      </div>
    </div>
  );
}
