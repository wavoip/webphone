import type { LucideProps } from "lucide-solid";

/**
 * Fronteira dos ícones: o resto do código importa daqui, e trocar de pacote é mexer só
 * neste arquivo. O nome que exportamos descreve o desenho no nosso vocabulário; o nome
 * que o pacote dá está no caminho do import, ao lado.
 *
 * O `lucide-solid` desenha um traço só, e foi isso que tirou da mesa inlinar os SVGs: o
 * pacote anterior embarcava os seis pesos de cada ícone e nós desenhávamos três.
 *
 * Import por subcaminho, e não pelo índice: são 2121 ícones em JSX cru, e o barril faria
 * o servidor de desenvolvimento compilar todos.
 */
export type IconProps = LucideProps;

export { default as Browser } from "lucide-solid/icons/app-window";
export { default as ArrowLeft } from "lucide-solid/icons/arrow-left";
export { default as Waveform } from "lucide-solid/icons/audio-waveform";
export { default as Bell } from "lucide-solid/icons/bell";
export { default as Check } from "lucide-solid/icons/check";
export { default as CaretDown } from "lucide-solid/icons/chevron-down";
export { default as CheckCircle } from "lucide-solid/icons/circle-check";
export { default as Copy } from "lucide-solid/icons/copy";
export { default as Backspace } from "lucide-solid/icons/delete";
export { default as Eye } from "lucide-solid/icons/eye";
export { default as EyeSlash } from "lucide-solid/icons/eye-off";
export { default as Globe } from "lucide-solid/icons/globe";
export { default as DotsNine } from "lucide-solid/icons/grid-3x3";
export { default as Translate } from "lucide-solid/icons/languages";
export { default as Spinner } from "lucide-solid/icons/loader-circle";
export { default as Microphone } from "lucide-solid/icons/mic";
export { default as MicrophoneSlash } from "lucide-solid/icons/mic-off";
export { default as Desktop } from "lucide-solid/icons/monitor";
export { default as Moon } from "lucide-solid/icons/moon";
export { default as Package } from "lucide-solid/icons/package";
export { default as Pause } from "lucide-solid/icons/pause";
export { default as Phone } from "lucide-solid/icons/phone";
export { default as PhoneTransfer } from "lucide-solid/icons/phone-forwarded";
export { default as PhoneIncoming } from "lucide-solid/icons/phone-incoming";
export { default as PhoneX } from "lucide-solid/icons/phone-missed";
export { default as PhoneSlash } from "lucide-solid/icons/phone-off";
export { default as PictureInPicture } from "lucide-solid/icons/picture-in-picture";
export { default as Plus } from "lucide-solid/icons/plus";
export { default as Power } from "lucide-solid/icons/power";
export { default as QrCode } from "lucide-solid/icons/qr-code";
export { default as Gear } from "lucide-solid/icons/settings";
export { default as Sliders } from "lucide-solid/icons/sliders-horizontal";
export { default as DeviceMobile } from "lucide-solid/icons/smartphone";
export { default as Stethoscope } from "lucide-solid/icons/stethoscope";
export { default as Sun } from "lucide-solid/icons/sun";
export { default as Trash } from "lucide-solid/icons/trash";
export { default as Warning } from "lucide-solid/icons/triangle-alert";
export { default as User } from "lucide-solid/icons/user";
export { default as VideoCameraSlash } from "lucide-solid/icons/video-off";
export { default as WifiHigh } from "lucide-solid/icons/wifi";
export { default as WifiMedium } from "lucide-solid/icons/wifi-high";
export { default as WifiLow } from "lucide-solid/icons/wifi-low";
export { default as WifiSlash } from "lucide-solid/icons/wifi-off";
export { default as WifiX } from "lucide-solid/icons/wifi-zero";
export { default as X } from "lucide-solid/icons/x";

/**
 * O lucide não desenha marca de terceiro, e esta é a única de que precisamos. Preenchida,
 * e não traçada, porque é a forma com que a marca é reconhecida.
 */
export function WhatsappLogo(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.size ?? 24}
      height={props.size ?? 24}
      fill={props.color ?? "currentColor"}
      class={props.class}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}
