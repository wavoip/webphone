import { useWavoip } from "@/providers/WavoipProvider";
import { useEffect, useState } from "react";

type Props = {
  waves: Number[];
};


export default function WaveSound({ waves }: Props) {
  // const { callActive } = useWavoip();
  // const [waves, setWaves] = useState(volume);
  const [percentBased, setPercentBased] = useState(0);

  useEffect(() => {
    const { min, max } = waves.reduce((curr, acc) => {
      if (!curr.min) {
        return {
          min: acc,
          max: acc
        }
      }
      let min = curr.min;
      let max = curr.max;

      if (acc < min) min = acc;
      if (acc > max) max = acc;

      return {
        min: min,
        max: max
      }

    }, { min: 0, max: 0 })
  }, [waves])
  // useEffect(() => {
  //   console.log("active call", callActive, callActive?.onVolume)
  //   callActive?.onVolume((volume: number) => {

  //     // const waveValue = volume * 100;
  //     console.log("volume", volume)

  //     // setWaves((prev) => {
  //     //   const novaFila = [...prev, waveValue];
  //     //   if (novaFila.length > 15) {
  //     //     novaFila.shift(); // remove o mais antigo
  //     //   }
  //     //   return novaFila;
  //     // });
  //   });

  // }, [callActive, callActive?.onError, callActive?.onPeerMute, callActive?.onPeerUnmute, callActive?.onEnd, callActive?.onVolume]);

  return (
    <div className="wv:flex wv:flex-row  wv:justify-center wv:items-center " >
      {waves.map((wave, index) => (
        <div
          key={index}
          className="wv:w-[1px] wv:bg-[green] wv:min-h-[4px] wv:subpixel-antialiased wv:rounded-[8px]"
          style={{
            height: `${wave}px`,
            transform: "scaleX(2)",
            transformOrigin: "center",
            marginRight: "4px",
            transition: `height 0.20s ease`,
            // animationDelay: `${index * 0.05}s`, // cada barra com delay diferente
          }}
        ></div>

      ))}
    </div>
  );
}
