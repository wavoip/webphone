import { Listener, WavoipClientToServerEvents, WavoipEmitArgs, WavoipServerToClientEvents } from './types/wavoip-socket';
export declare class WavoipSocket {
    readonly device_token: string;
    private readonly base_url;
    private readonly socket;
    private readonly listeners;
    private call_id;
    constructor(device_token: string);
    private callListeners;
    bindListener<T extends keyof WavoipServerToClientEvents>(event: T, listener: {
        id: string;
        fn: Listener<T>;
    }): void;
    checkListenerExists<T extends keyof WavoipServerToClientEvents>(event: T, id: string): boolean;
    emit<T extends keyof WavoipClientToServerEvents>(event: T, ...args: WavoipEmitArgs<T>): void;
    removeListener<T extends keyof WavoipServerToClientEvents>(event: T, id: string): void;
}
