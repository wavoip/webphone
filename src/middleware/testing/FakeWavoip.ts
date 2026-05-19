import type {
  CallActive,
  CallActiveEvents,
  CallOutgoing,
  CallOutgoingEvents,
  CallPeer,
  Contact,
  Device,
  DeviceEvents,
  DeviceStatus,
  Offer,
  OfferEvents,
  Wavoip,
} from "@wavoip/wavoip-api";

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

export class FakeOffer extends FakeEmitter<OfferEvents> implements Offer {
  type = "OFFICIAL" as const;
  direction = "INCOMING" as const;
  status = "RINGING" as const;
  acceptResult: { call: CallActive | null; err: string | null } = { call: null, err: "not-set" };
  rejectResult: { err: string | null } = { err: null };
  readonly id: string;
  readonly device_token: string;
  peer: CallPeer;

  constructor(id: string, device_token: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.device_token = device_token;
    this.peer = peer;
  }

  accept = async () => this.acceptResult as { call: CallActive; err: null } | { call: null; err: string };
  reject = async () => this.rejectResult;
  onAcceptedElsewhere() {}
  onRejectedElsewhere() {}
  onUnanswered() {}
  onEnd() {}
  onStatus() {}
}

export class FakeCallOutgoing extends FakeEmitter<CallOutgoingEvents> implements CallOutgoing {
  type = "OFFICIAL" as const;
  direction = "OUTGOING" as const;
  status = "CALLING" as const;
  readonly id: string;
  readonly device_token: string;
  peer: CallPeer;

  constructor(id: string, device_token: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.device_token = device_token;
    this.peer = peer;
  }

  mute = async () => ({ err: null });
  unmute = async () => ({ err: null });
  end = async () => ({ err: null });
  onPeerAccept() {}
  onPeerReject() {}
  onUnanswered() {}
  onEnd() {}
  onStatus() {}
}

export class FakeCallActive extends FakeEmitter<CallActiveEvents> implements CallActive {
  type = "OFFICIAL" as const;
  direction = "OUTGOING" as const;
  status = "ACTIVE" as const;
  connection_status = "connected" as const;
  audio_analyser = Promise.resolve({} as AnalyserNode);
  readonly id: string;
  readonly device_token: string;
  peer: CallPeer;

  constructor(id: string, device_token: string, peer: CallPeer = makePeer()) {
    super();
    this.id = id;
    this.device_token = device_token;
    this.peer = peer;
  }

  mute = async () => ({ err: null });
  unmute = async () => ({ err: null });
  end = async () => ({ err: null });
  onError() {}
  onPeerMute() {}
  onPeerUnmute() {}
  onEnd() {}
  onStats() {}
  onConnectionStatus() {}
  onStatus() {}
}

export class FakeDevice extends FakeEmitter<DeviceEvents> implements Device {
  qrCode?: string;
  contact?: Contact;
  status: DeviceStatus = "disconnected";
  readonly token: string;

  constructor(token: string) {
    super();
    this.token = token;
  }

  restart = async () => {};
  logout = async () => {};
  wakeUp = async () => true;
  pairingCode = async () => ({ pairingCode: "0000", err: null as null });
  onStatus = () => () => {};
  onQRCode = () => () => {};
  onContact = () => () => {};
}

type WavoipEvents = { offer: [Offer] };

export class FakeWavoip extends FakeEmitter<WavoipEvents> {
  private _devices: FakeDevice[] = [];
  startCallResult: {
    call: CallOutgoing | null;
    err: { message: string; devices: { token: string; reason: string }[] } | null;
  } = { call: null, err: { message: "not-set", devices: [] } };
  startCallCalls: { fromTokens?: string[]; to: string }[] = [];

  constructor(initialTokens: string[] = []) {
    super();
    this._devices = initialTokens.map((t) => new FakeDevice(t));
  }

  startCall = async (params: { fromTokens?: string[]; to: string }) => {
    this.startCallCalls.push(params);
    return this.startCallResult as
      | { call: CallOutgoing; err: null }
      | { call: null; err: { message: string; devices: { token: string; reason: string }[] } };
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
