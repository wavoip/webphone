import { AudioSocket } from '../../presentation/socket/audio';
import { WavoipSocket } from '../../presentation/socket/wavoip';
export declare class Audio {
    private readonly wavoip_socket;
    private audio_socket;
    private id;
    private SAMPLE_RATE;
    private worklet_stream;
    private is_running;
    constructor(wavoip_socket: WavoipSocket, audio_socket: AudioSocket);
    start(sampleRate: number): void;
    stop(): void;
    checkPermission(): void;
    checkError(): {
        type: string;
        message: string;
    } | null;
}
