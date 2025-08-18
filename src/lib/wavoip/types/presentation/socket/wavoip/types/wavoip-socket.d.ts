import { DeviceStatus } from '../../../../features/device/types/device-status';
import { Signaling } from './signaling';
import { WavoipResponse } from './wavoip-response';
import { Socket } from 'socket.io-client';
export interface WavoipServerToClientEvents {
    "audio_transport:create": (data: {
        ip: string;
        port: string;
    }) => void;
    "audio_transport:terminate": () => void;
    qrcode: (qrcode: string) => void;
    device_status: (device_status: DeviceStatus) => void;
    signaling: (data: Signaling, call_id: string) => void;
    "peer:accepted_elsewhere": (call_id: string) => void;
    "calls:error": (error: string) => void;
}
export interface WavoipClientToServerEvents {
    "calls:start": (whatsapp_id: string, callback: (response: WavoipResponse) => void) => void;
    "calls:reject": (call_id: string, callback: (response: WavoipResponse) => void) => void;
    "calls:mute": (callback: (response: WavoipResponse) => void) => void;
    "calls:unmute": (callback: (response: WavoipResponse) => void) => void;
    "calls:end": (callback: (response: WavoipResponse) => void) => void;
    "calls:accept": (call_id: string, callback: (response: WavoipResponse) => void) => void;
    "whatsapp:qrcode": (callback: (qrcode: string) => void) => void;
    "whatsapp:device_status": (callback: (device_status: DeviceStatus | "") => void) => void;
}
export type WavoipSocket = Socket<WavoipServerToClientEvents, WavoipClientToServerEvents>;
export type Listener<T extends keyof WavoipServerToClientEvents> = (...args: Parameters<WavoipServerToClientEvents[T]>) => ReturnType<WavoipServerToClientEvents[T]>;
export type ListenerEntry<T extends keyof WavoipServerToClientEvents> = {
    id: string;
    fn: Listener<T>;
};
export type WavoipEventListeners = {
    [K in keyof WavoipServerToClientEvents]: ListenerEntry<K>[];
};
export type WavoipEmitArgs<T extends keyof WavoipClientToServerEvents> = Parameters<(...args: Parameters<WavoipClientToServerEvents[T]>) => ReturnType<WavoipClientToServerEvents[T]>>;
