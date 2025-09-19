import { BackspaceIcon, PhoneIcon } from "@phosphor-icons/react";
import { useState } from "react";
import SoundDTMF0 from "@/assets/sounds/dtmf-0.mp3";
import SoundDTMF1 from "@/assets/sounds/dtmf-1.mp3";
import SoundDTMF2 from "@/assets/sounds/dtmf-2.mp3";
import SoundDTMF3 from "@/assets/sounds/dtmf-3.mp3";
import SoundDTMF4 from "@/assets/sounds/dtmf-4.mp3";
import SoundDTMF5 from "@/assets/sounds/dtmf-5.mp3";
import SoundDTMF6 from "@/assets/sounds/dtmf-6.mp3";
import SoundDTMF7 from "@/assets/sounds/dtmf-7.mp3";
import SoundDTMF8 from "@/assets/sounds/dtmf-8.mp3";
import SoundDTMF9 from "@/assets/sounds/dtmf-9.mp3";
import SoundDTMFHash from "@/assets/sounds/dtmf-hash.mp3";
import SoundDTMFStar from "@/assets/sounds/dtmf-star.mp3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleMultimediaError, useWavoip } from "@/providers/WavoipProvider";

const buttons = {
  0: {
    digits: "+",
    audio: new Audio(SoundDTMF0),
  },
  1: {
    digits: "",
    audio: new Audio(SoundDTMF1),
  },
  2: {
    digits: "ABC",
    audio: new Audio(SoundDTMF2),
  },
  3: {
    digits: "DEF",
    audio: new Audio(SoundDTMF3),
  },
  4: {
    digits: "GHI",
    audio: new Audio(SoundDTMF4),
  },
  5: {
    digits: "JKL",
    audio: new Audio(SoundDTMF5),
  },
  6: {
    digits: "MNO",
    audio: new Audio(SoundDTMF6),
  },
  7: {
    digits: "PQES",
    audio: new Audio(SoundDTMF7),
  },
  8: {
    digits: "TUV",
    audio: new Audio(SoundDTMF8),
  },
  9: {
    digits: "WXYZ",
    audio: new Audio(SoundDTMF9),
  },
  "*": {
    digits: "",
    audio: new Audio(SoundDTMFStar),
  },
  "#": {
    digits: "",
    audio: new Audio(SoundDTMFHash),
  },
};

export default function KeyboardScreen() {
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState("");

  const { multimediaError, makeCall } = useWavoip();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        makeCall(number).then(({ err }) => {
          if (!err) return;
          setStatus(err.message);
          setTimeout(() => {
            setStatus("");
          }, 3000);
        });
      }}
      className="wv:flex wv:flex-col wv:size-full wv:items-center wv:justify-evenly wv:px-6"
    >
      <p className="wv:flex wv:justify-center wv:items-center">{status}</p>

      {!!multimediaError && (
        <p className="wv:flex wv:justify-center wv:items-center">{handleMultimediaError(multimediaError)}</p>
      )}

      <div className="wv:text-center">
        <Input
          placeholder="Digite..."
          value={number}
          onChange={(e) => {
            const digits = e.target.value.match(/[\d*#]+/g)?.[0] || "";
            setNumber(digits);
            if (digits.length) {
              const lastDigit = digits[digits.length - 1] as keyof typeof buttons;
              buttons[lastDigit].audio.play();
            }
          }}
          className="wv:border-b-2 wv:border-l-0 wv:border-r-0 wv:border-t-0 wv:shadow-none wv:rounded-none wv:text-xl wv:text-foreground wv:text-center wv:focus-visible:ring-0"
        />
      </div>

      <div className="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-3 wv:[&>*]:select-none">
        {Object.entries(buttons).map(([key, { digits, audio }]) => (
          <Button
            key={`webphone-keyboard-${key}`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
            onClick={() => {
              setNumber((prev) => prev + key);
              audio.play();
            }}
          >
            <p className="wv:text-lg wv:font-bold">{key}</p>
            {!!digits && <p className="wv:text-xs wv:font-light wv:text-muted-400">{digits}</p>}
          </Button>
        ))}
      </div>

      <div className="wv:w-full wv:flex wv:justify-evenly wv:justify-items-center wv:[&>*]:select-none">
        <Button
          type="button"
          variant={"secondary"}
          size={"icon"}
          onClick={() => {
            setNumber((prev) => prev.slice(0, -1));
          }}
          className="wv:aspect-square wv:size-fit wv:p-2 wv:hover:bg-muted-foreground wv:hover:text-background wv:text-foreground wv:hover:cursor-pointer"
        >
          <BackspaceIcon className="wv:size-6" />
        </Button>
        <Button
          type="submit"
          size={"icon"}
          className="wv:text-background wv:size-fit wv:aspect-square wv:p-2 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer"
          disabled={!!multimediaError}
        >
          <PhoneIcon className="wv:size-6" />
        </Button>
      </div>
    </form>
  );
}
