import type {
  AcceptFailure,
  ActiveCall,
  ActiveCallEvents,
  CallAudio,
  CallConnection,
  CallPeer,
  CallStats,
  CommandFailure,
  Contact,
  Device,
  DeviceApiFailure,
  DeviceEvents,
  DeviceRestriction,
  DeviceStatus,
  IncomingCall,
  IncomingCallEvents,
  OutgoingCall,
  OutgoingCallEvents,
  Result,
  StartCallFailure,
  Wavoip,
} from "@wavoip/wavoip-api/web";

export function ok<T>(data: T): { data: T; error: null } {
  return { data, error: null };
}

export function err<E>(error: E): { data: null; error: E } {
  return { data: null, error };
}

function makeEmptyCallStats(): CallStats {
  return {
    rtt: { min: 0, max: 0, avg: 0 },
    latency: { total_ms: null, network_ms: null, whatsapp_ms: null, jitter_buffer_ms: null, playout_ms: null },
    audio: { tx: { level: 0, bitrate_kbps: 0 }, rx: { level: 0, bitrate_kbps: 0, jitter_ms: 0 } },
    packets: { tx: { sent: 0, lost: 0, bytes: 0 }, rx: { received: 0, lost: 0, bytes: 0 } },
  };
}

/** Silêncio: o medidor lê zero e o espectro vem vazio, como na plataforma que não vê o áudio. */
function makeSilentAudio(): CallAudio {
  const silent = { level: () => 0, spectrum: () => new Uint8Array(), clipping: () => 0 };
  return { in: silent, out: silent };
}

type Listener = (...args: unknown[]) => void;

class FakeEmitter<TEvents extends Record<string, unknown[]>> {
  private listeners = new Map<keyof TEvents, Listener[]>();

  on<E extends keyof TEvents>(event: E, cb: (...args: TEvents[E]) => void) {
    const arr = this.listeners.get(event) ?? [];
    arr.push(cb as Listener);
    this.listeners.set(event, arr);
    return () => {
      const next = (this.listeners.get(event) ?? []).filter((l) => l !== cb);
      this.listeners.set(event, next);
    };
  }

  emitEvent<E extends keyof TEvents>(event: E, ...args: TEvents[E]) {
    for (const cb of this.listeners.get(event) ?? []) cb(...args);
  }
}

export function makePeer(phone = "5511999999999"): CallPeer {
  return { phone, displayName: null, profilePicture: null, muted: false };
}

export class FakeIncomingCall extends FakeEmitter<IncomingCallEvents> implements IncomingCall {
  type = "OFFICIAL" as const;
  direction = "INCOMING" as const;
  status = "RINGING" as const;
  acceptResult: Result<ActiveCall, AcceptFailure> = err({ code: "UNKNOWN" as const });
  rejectResult: Result<void, CommandFailure> = ok(undefined);
  readonly id: string;
  readonly deviceToken: string;
  peer: CallPeer;

  constructor(id: string, deviceToken: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.deviceToken = deviceToken;
    this.peer = peer;
  }

  accept = async () => this.acceptResult;
  reject = async () => this.rejectResult;
}

export class FakeOutgoingCall extends FakeEmitter<OutgoingCallEvents> implements OutgoingCall {
  type = "OFFICIAL" as const;
  direction = "OUTGOING" as const;
  status = "CALLING" as const;
  cancelResult: Result<void, CommandFailure> = ok(undefined);
  cancelCalls = 0;
  readonly id: string;
  readonly deviceToken: string;
  peer: CallPeer;

  constructor(id: string, deviceToken: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.deviceToken = deviceToken;
    this.peer = peer;
  }

  mute = async () => ok(undefined);
  unmute = async () => ok(undefined);
  cancel = async () => {
    this.cancelCalls++;
    return this.cancelResult;
  };
}

export class FakeActiveCall extends FakeEmitter<ActiveCallEvents> implements ActiveCall {
  type = "OFFICIAL" as const;
  direction = "OUTGOING" as const;
  status = "ACTIVE" as const;
  connection: CallConnection = "connected";
  audio: CallAudio = makeSilentAudio();
  endResult: Result<void, CommandFailure> = ok(undefined);
  readonly id: string;
  readonly deviceToken: string;
  peer: CallPeer;

  constructor(id: string, deviceToken: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.deviceToken = deviceToken;
    this.peer = peer;
  }

  mute = async () => ok(undefined);
  unmute = async () => ok(undefined);
  end = async () => this.endResult;
  getStats = async () => makeEmptyCallStats();
}

export class FakeDevice extends FakeEmitter<DeviceEvents> implements Device {
  qrCode: string | null = null;
  contact: Contact | null = null;
  status: DeviceStatus = "BUILDING";
  connectionStatus: "connected" | "disconnected" | "reconnecting" = "disconnected";
  restriction: DeviceRestriction | null = null;
  activeCalls = 0;
  readonly token: string;

  constructor(token: string) {
    super();
    this.token = token;
  }

  restart = async (): Promise<Result<void, DeviceApiFailure>> => ok(undefined);
  logout = async (): Promise<Result<void, DeviceApiFailure>> => ok(undefined);
  wakeUp = async (): Promise<Result<void, DeviceApiFailure>> => ok(undefined);
  pairingCode = async (): Promise<Result<string, CommandFailure>> => ok("0000");
}

type WavoipEvents = { offer: [IncomingCall] };

export class FakeWavoip extends FakeEmitter<WavoipEvents> {
  private _devices: FakeDevice[] = [];
  startCallResult: Result<OutgoingCall, StartCallFailure> = err({ code: "NO_DEVICES" as const, devices: [] });
  startCallCalls: { fromTokens?: string[]; to: string }[] = [];

  constructor(initialTokens: string[] = []) {
    super();
    this._devices = initialTokens.map((t) => new FakeDevice(t));
  }

  startCall = async (params: { fromTokens?: string[]; to: string }) => {
    this.startCallCalls.push(params);
    return this.startCallResult;
  };

  getDevices = () => this._devices as unknown as Device[];

  addDevices = (tokens: string[] = []) => {
    const added: FakeDevice[] = [];
    for (const token of tokens) {
      if (this._devices.some((d) => d.token === token)) continue;
      const d = new FakeDevice(token);
      this._devices.push(d);
      added.push(d);
    }
    return added as unknown as Device[];
  };

  removeDevices = (tokens: string[]) => {
    this._devices = this._devices.filter((d) => !tokens.includes(d.token));
    return this._devices as unknown as Device[];
  };

  asWavoip(): Wavoip {
    return this as unknown as Wavoip;
  }
}
