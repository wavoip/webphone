import { WavoipSocket } from '../wavoip';
export declare class AudioSocket {
    private readonly device_token;
    private readonly wavoip_socket;
    private readonly id;
    private socket;
    private listeners;
    private readonly RECONNECT_CODES;
    socket_is_ready: boolean;
    constructor(device_token: string, wavoip_socket: WavoipSocket);
    private callListeners;
    bindListener(listener: {
        id: string;
        fn: (data: ArrayBufferLike) => void;
    }): false | undefined;
    checkListenerExists(id: string): boolean;
    emit(data: ArrayBufferLike): void;
    start(url: string): void;
    stop(): void;
    removeListener(id: string): void;
}
