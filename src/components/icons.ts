/**
 * O projeto usa um pacote de ícones só. Este módulo é a fronteira: o resto do código
 * importa daqui, e trocar de pacote — ou inlinar os SVGs — é mexer só neste arquivo.
 *
 * Os nomes terminados em `Icon` vêm do tempo em que havia dois pacotes; o que era do
 * lucide virou o equivalente do phosphor.
 *
 * O `phosphor-solid` é um port de uma versão antiga e não tem tudo: `SpinnerGap` faz o
 * papel do `CircleNotch`, `Waves` o do `Waveform`, `Activity` o do `Stethoscope` e
 * `PhoneOutgoing` o do `PhoneTransfer`. Inlinar os SVGs resolveria isso e os seis pesos
 * que o pacote carrega — ver DEV-544.
 */

export type { IconProps } from "phosphor-solid";
export {
  Activity,
  ArrowLeft,
  Backspace,
  Bell,
  Browser,
  CaretDown,
  Check,
  CheckCircle,
  Copy,
  Desktop,
  DeviceMobile,
  DotsNine,
  Eye,
  EyeSlash,
  Gear,
  Globe,
  Microphone,
  MicrophoneSlash,
  Moon,
  Package,
  Pause,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneSlash,
  PhoneX,
  PictureInPicture,
  Plus,
  Power,
  QrCode,
  Sliders,
  SpinnerGap,
  Sun,
  Translate,
  Trash,
  User,
  VideoCameraSlash,
  Warning,
  Waves,
  WhatsappLogo,
  WifiHigh,
  WifiLow,
  WifiMedium,
  WifiSlash,
  WifiX,
  X,
} from "phosphor-solid";
