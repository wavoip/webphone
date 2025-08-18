import { WavoipSocket } from '../../presentation/socket/wavoip';
export type Call = {
    id: string;
    end: () => Promise<void>;
    mute: () => Promise<void>;
    unmute: () => Promise<void>;
};
export type Caller = string;
export type Incoming = {
    caller: Caller;
    accept: () => Promise<Call>;
    reject: () => Promise<void>;
};
export declare class CallController {
    private readonly wavoip_socket;
    private id;
    private calls;
    private is_call_happening;
    constructor(wavoip_socket: WavoipSocket);
    start(params: {
        whatsappid: string;
        onAccept: (call: Call) => void;
        onReject: () => void;
        onEnd: () => void;
        onError: (error: string) => void;
        onMute: () => void;
        onUnmute: () => void;
    }): Promise<void>;
    onCallReceive(events: {
        onReceive: (incoming: Incoming) => void;
        onAcceptedElsewhere: () => void;
        onUnanswered: () => void;
        onEnd: () => void;
        onMute: () => void;
        onUnmute: () => void;
        onError: (reason: string) => void;
    }): void;
    end(): Promise<void>;
    accept(call_id: string): Promise<void>;
    reject(call_Id: string): Promise<void>;
    mute(): Promise<void>;
    unMute(): Promise<void>;
}
