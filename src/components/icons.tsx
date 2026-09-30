import type { LucideProps } from "lucide-solid";
import BrowserGlyph from "lucide-solid/icons/app-window";
import ArrowLeftGlyph from "lucide-solid/icons/arrow-left";
import WaveformGlyph from "lucide-solid/icons/audio-waveform";
import BellGlyph from "lucide-solid/icons/bell";
import CheckGlyph from "lucide-solid/icons/check";
import CaretDownGlyph from "lucide-solid/icons/chevron-down";
import CheckCircleGlyph from "lucide-solid/icons/circle-check";
import CopyGlyph from "lucide-solid/icons/copy";
import BackspaceGlyph from "lucide-solid/icons/delete";
import EyeGlyph from "lucide-solid/icons/eye";
import EyeSlashGlyph from "lucide-solid/icons/eye-off";
import GlobeGlyph from "lucide-solid/icons/globe";
import DotsNineGlyph from "lucide-solid/icons/grid-3x3";
import TranslateGlyph from "lucide-solid/icons/languages";
import SpinnerGlyph from "lucide-solid/icons/loader-circle";
import MicrophoneGlyph from "lucide-solid/icons/mic";
import MicrophoneSlashGlyph from "lucide-solid/icons/mic-off";
import DesktopGlyph from "lucide-solid/icons/monitor";
import MoonGlyph from "lucide-solid/icons/moon";
import PackageGlyph from "lucide-solid/icons/package";
import PauseGlyph from "lucide-solid/icons/pause";
import PhoneGlyph from "lucide-solid/icons/phone";
import PhoneTransferGlyph from "lucide-solid/icons/phone-forwarded";
import PhoneIncomingGlyph from "lucide-solid/icons/phone-incoming";
import PhoneXGlyph from "lucide-solid/icons/phone-missed";
import PhoneSlashGlyph from "lucide-solid/icons/phone-off";
import PictureInPictureGlyph from "lucide-solid/icons/picture-in-picture";
import PlusGlyph from "lucide-solid/icons/plus";
import PowerGlyph from "lucide-solid/icons/power";
import QrCodeGlyph from "lucide-solid/icons/qr-code";
import GearGlyph from "lucide-solid/icons/settings";
import SlidersGlyph from "lucide-solid/icons/sliders-horizontal";
import DeviceMobileGlyph from "lucide-solid/icons/smartphone";
import StethoscopeGlyph from "lucide-solid/icons/stethoscope";
import SunGlyph from "lucide-solid/icons/sun";
import TrashGlyph from "lucide-solid/icons/trash";
import WarningGlyph from "lucide-solid/icons/triangle-alert";
import UserGlyph from "lucide-solid/icons/user";
import VideoCameraSlashGlyph from "lucide-solid/icons/video-off";
import WifiHighGlyph from "lucide-solid/icons/wifi";
import WifiMediumGlyph from "lucide-solid/icons/wifi-high";
import WifiLowGlyph from "lucide-solid/icons/wifi-low";
import WifiSlashGlyph from "lucide-solid/icons/wifi-off";
import XGlyph from "lucide-solid/icons/x";
import { type JSX, splitProps } from "solid-js";

/**
 * Fronteira dos ícones: o resto do código importa daqui, e trocar de pacote é mexer só
 * neste arquivo. O nome que exportamos descreve o desenho no nosso vocabulário; o nome
 * que o lucide dá está no caminho do import, ao lado.
 *
 * Import por subcaminho, e não pelo índice: são 2121 ícones em JSX cru, e o barril faria
 * o servidor de desenvolvimento compilar todos — o que também descarta o `LucideProvider`,
 * que só o índice exporta.
 */
export type IconProps = LucideProps & {
  /**
   * Pinta o miolo além do traço. O lucide desenha contorno, e preencher só faz sentido
   * onde a silhueta é fechada: no telefone, sim; no triângulo de aviso, o preenchimento
   * engoliria a exclamação de dentro.
   */
  filled?: boolean;
};

type Glyph = (props: LucideProps) => JSX.Element;

const QUADRO_LUCIDE = 24;

/**
 * Cada ícone tem o fator com que o desenho do lucide saiu maior que o do pacote anterior
 * na mesma caixa, medido par a par com `getBBox` na migração — de 0,93 a 1,37, porque são
 * desenhos diferentes. Alargar o quadro na proporção devolve o tamanho de antes sem
 * encostar em nenhum uso, e ainda afina o traço junto.
 *
 * **Ícone novo não leva fator.** A tabela existe para a v1.9.1 não mudar de cara na
 * atualização; fora disso, o tamanho do lucide é o tamanho.
 */
function viewBox(escala: number): string {
  const lado = QUADRO_LUCIDE * escala;
  const folga = (lado - QUADRO_LUCIDE) / 2;
  return `${-folga} ${-folga} ${lado} ${lado}`;
}

/**
 * O lucide desenha 24px quando ninguém pede tamanho; o pacote anterior desenhava `1em`, e
 * é disso que os tamanhos do webphone dependem — ícone sem classe acompanha a fonte de
 * quem o contém.
 */
function icon(Glyph: Glyph, escala = 1) {
  const quadro = viewBox(escala);
  return (props: IconProps): JSX.Element => {
    const [local, rest] = splitProps(props, ["filled"]);
    return <Glyph size="1em" viewBox={quadro} fill={local.filled ? "currentColor" : "none"} {...rest} />;
  };
}

export const ArrowLeft = icon(ArrowLeftGlyph, 0.97);
export const Backspace = icon(BackspaceGlyph, 1.048);
export const Bell = icon(BellGlyph, 1.086);
export const Browser = icon(BrowserGlyph, 1.222);
export const CaretDown = icon(CaretDownGlyph, 0.933);
export const Check = icon(CheckGlyph, 1.143);
export const CheckCircle = icon(CheckCircleGlyph, 1.128);
export const Copy = icon(CopyGlyph, 1.333);
export const Desktop = icon(DesktopGlyph, 1.222);
export const DeviceMobile = icon(DeviceMobileGlyph, 1.048);
export const DotsNine = icon(DotsNineGlyph, 1.333);
export const Eye = icon(EyeGlyph, 1.048);
export const EyeSlash = icon(EyeSlashGlyph, 1.048);
export const Gear = icon(GearGlyph, 1.167);
export const Globe = icon(GlobeGlyph, 1.222);
export const Microphone = icon(MicrophoneGlyph, 1.048);
export const MicrophoneSlash = icon(MicrophoneSlashGlyph, 1.048);
export const Moon = icon(MoonGlyph, 1.18);
export const Package = icon(PackageGlyph, 1.098);
export const Pause = icon(PauseGlyph, 1.111);
export const Phone = icon(PhoneGlyph, 1.175);
export const PhoneIncoming = icon(PhoneIncomingGlyph, 1.175);
export const PhoneSlash = icon(PhoneSlashGlyph, 0.993);
export const PhoneTransfer = icon(PhoneTransferGlyph, 1.175);
export const PhoneX = icon(PhoneXGlyph, 1.175);
export const PictureInPicture = icon(PictureInPictureGlyph, 1.128);
export const Plus = icon(PlusGlyph, 0.97);
export const Power = icon(PowerGlyph, 1.331);
export const QrCode = icon(QrCodeGlyph, 1.213);
export const Sliders = icon(SlidersGlyph, 1.159);
export const Spinner = icon(SpinnerGlyph, 1.111);
export const Stethoscope = icon(StethoscopeGlyph, 1.128);
export const Sun = icon(SunGlyph, 1.048);
export const Translate = icon(TranslateGlyph, 1.128);
export const Trash = icon(TrashGlyph, 1.222);
export const User = icon(UserGlyph, 1.1);
export const VideoCameraSlash = icon(VideoCameraSlashGlyph, 0.978);
export const Warning = icon(WarningGlyph, 1.049);
export const Waveform = icon(WaveformGlyph, 1.333);
export const WifiHigh = icon(WifiHighGlyph, 1.14);
export const WifiLow = icon(WifiLowGlyph, 1.369);
export const WifiMedium = icon(WifiMediumGlyph, 1.236);
export const WifiSlash = icon(WifiSlashGlyph, 1.14);
export const X = icon(XGlyph, 1.037);

/**
 * O lucide não desenha marca de terceiro, e esta é a única de que precisamos. Sempre
 * preenchida: é a forma com que a marca é reconhecida.
 */
export function WhatsappLogo(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.size ?? "1em"}
      height={props.size ?? "1em"}
      fill={props.color ?? "currentColor"}
      class={props.class}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}
