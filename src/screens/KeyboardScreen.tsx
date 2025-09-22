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
import SoundBackspace from "@/assets/sounds/backspace.mp3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleMultimediaError, useWavoip } from "@/providers/WavoipProvider";
import WaveBars from "@/components/WaveSound";

const buttons = [
  {
    digit: "1",
    letters: "",
    audio: new Audio(SoundDTMF1),
  },
  {
    digit: "2",
    letters: "ABC",
    audio: new Audio(SoundDTMF2),
  },
  {
    digit: "3",
    letters: "DEF",
    audio: new Audio(SoundDTMF3),
  },
  {
    digit: "4",
    letters: "GHI",
    audio: new Audio(SoundDTMF4),
  },
  {
    digit: "5",
    letters: "JKL",
    audio: new Audio(SoundDTMF5),
  },
  {
    digit: "6",
    letters: "MNO",
    audio: new Audio(SoundDTMF6),
  },
  {
    digit: "7",
    letters: "PQES",
    audio: new Audio(SoundDTMF7),
  },
  {
    digit: "8",
    letters: "TUV",
    audio: new Audio(SoundDTMF8),
  },
  {
    digit: "9",
    letters: "WXYZ",
    audio: new Audio(SoundDTMF9),
  },
  {
    digit: "*",
    letters: "",
    audio: new Audio(SoundDTMFStar),
  },
  {
    digit: "0",
    letters: "+",
    audio: new Audio(SoundDTMF0),
  },
  {
    digit: "#",
    letters: "",
    audio: new Audio(SoundDTMFHash),
  },
];

const backspace_audio = new Audio(SoundBackspace);

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
      className="wv:flex wv:flex-col wv:size-full wv:items-center wv:justify-evenly wv:px-2 wv:pb-4"
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
            // if (digits.length) {
            //   const lastDigit = digits[digits.length - 1];
            //   const button = buttons.find((item) => item.digit === lastDigit);
            //   if (button) {
            //     button.audio.pause();
            //     button.audio.currentTime = 0
            //     button.audio.play();
            //   }

            // }
          }}
          className="wv:border-none wv:border-l-0 wv:border-r-0 wv:border-t-0 wv:shadow-none wv:rounded-none wv:text-[24px] wv:md:text-[24px]  wv:text-foreground wv:text-center wv:focus-visible:ring-0"
        />
        <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em]">Brasil</p>
      </div>

      <div className="wv:grid wv:grid-cols-3 wv:grid-rows-4 wv:w-full wv:gap-3 wv:[&>*]:select-none">
        {Object.entries(buttons).map(([key, { digit, letters, audio }]) => (
          <Button
            key={`webphone-keyboard-${key}`}
            type="button"
            variant={"secondary"}
            className="wv:aspect-square wv:size-full wv:rounded-full wv:hover:bg-muted-foreground wv:hover:text-background wv:hover:cursor-pointer wv:text-foreground wv:flex wv:flex-col wv:justify-center wv:items-center wv:gap-0"
            onClick={() => {
              setNumber((prev) => prev + digit);
              audio.pause();
              audio.currentTime = 0
              audio.play();
            }}
          >
            <p className="wv:text-[24px] wv:leading-6 wv:font-semibold ">{digit}</p>
            {!!letters && <p className="wv:text-[10px] wv:font-light wv:text-muted-400 wv:tracking-[.15em]">{letters}</p>}
          </Button>
        ))}
      </div>

      <div className="wv:grid wv:grid-cols-3 wv:grid-rows-1 wv:w-full wv:gap-3 wv:[direction:rtl] justify-items-center">
        <Button
          type="button"
          variant={"secondary"}
          size={"icon"}
          onClick={() => {
            backspace_audio.pause();
            backspace_audio.currentTime = 0
            backspace_audio.play();

            setNumber((prev) => prev.slice(0, -1));
          }}
          className="wv:aspect-square wv:size-fit wv:p-2 wv:shadow-none wv:bg-[transparent] wv:hover:bg-[transparent] wv:hover:text-[green] vw:border-none wv:text-foreground wv:hover:cursor-pointer wv:h-[56px]"
        >
          <BackspaceIcon className="wv:size-5" weight="fill" />
        </Button>

        <Button
          type="submit"
          size={"icon"}
          className="wv:text-background wv:p-4 wv:bg-green-500 wv:hover:bg-green-700 wv:hover:cursor-pointer wv:w-full wv:rounded-full wv:h-[56px]"
          disabled={!!multimediaError}
        >
          <PhoneIcon className="wv:size-5" weight="fill" />
        </Button>
      </div>
    </form>
  );
}
