import { AudioSocket } from '../../presentation/socket/audio';
import { WavoipSocket } from '../../presentation/socket/wavoip';
export declare class Microphone {
    private readonly wavoip_socket;
    private readonly audio_socket;
    private id;
    private audio_context;
    private mic_stream;
    private mic_source;
    private microphones_devices_list;
    constructor(wavoip_socket: WavoipSocket, audio_socket: AudioSocket);
    start(): Promise<void>;
    stop(): Promise<void>;
    fetchMicrophones(): Promise<void>;
    requestMicrophonePermission(): Promise<void>;
    checkMicrophonePermission(): Promise<PermissionState>;
    checkError(): Promise<{
        type: string;
        message: string;
    } | null>;
}
