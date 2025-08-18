import { Call, Incoming } from './features/call/call-controller';
import { DeviceStatus } from './features/device/types/device-status';
export declare class Wavoip {
    private wavoip_socket;
    private audio_socket;
    private device;
    private audio;
    private microphone;
    private call;
    constructor(device_token: string);
    get deviceStatus(): DeviceStatus | "" | null;
    get QRCode(): string | null;
    wakeDeviceUp(): Promise<void>;
    startCall(params: {
        to: string;
        onAccept: (call: Call) => void;
        onReject: () => void;
        onEnd: () => void;
        onError: (error: string) => void;
        onMute: () => void;
        onUnmute: () => void;
    }): Promise<void>;
    onCall(events: {
        onReceive: (incoming: Incoming) => void;
        onAcceptedElsewhere: () => void;
        onUnanswered: () => void;
        onEnd: () => void;
        onMute: () => void;
        onUnmute: () => void;
        onError: (reason: string) => void;
    }): Promise<void>;
}
