import { ArrowsOutCardinalIcon, EyeClosedIcon } from "@phosphor-icons/react";
import { useDraggable } from "@/providers/DraggableProvider";

export default function StatusBar() {
  const { startDrag, close } = useDraggable();

  return (
    <div className="w-full h-6 bg-foreground flex justify-end shadow-lg px-2 rounded-2xl rounded-bl-none rounded-br-none">
      <div>
        <button type="button" onMouseDown={startDrag} className="active:bg-green-800 rounded-2xl">
          <ArrowsOutCardinalIcon size={24} />
        </button>
        <button type="button" onClick={() => close()}>
          <EyeClosedIcon size={24} />
        </button>
      </div>
    </div>
  );
}
