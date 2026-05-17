import type { CallStatus } from "@/hooks/useCallManager";
import type { Device, DeviceState } from "@/lib/webphone-api/sdk-types";
import type { CallActiveProps, CallOfferProps, CallOutgoingProps } from "@/lib/webphone-api/WebphoneAPI";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme, WebphonePosition, WidgetButtonPosition } from "@/providers/settings/settings";

export type ACLScreen = "call" | "keyboard" | "outgoing" | "incoming";

export type EventMap = {
  "acl.ready": void;

  "call.active.changed": CallActiveProps | undefined;
  "call.outgoing.changed": CallOutgoingProps | undefined;
  "call.status.changed": CallStatus;
  "call.peer.muted.changed": boolean;
  "call.input.changed": string;

  "offer.received": CallOfferProps;
  "offer.list.changed": CallOfferProps[];
  "offer.ended": { id: string };

  "device.list.changed": DeviceState[];
  "device.status.changed": { token: string; status: Device["status"] };
  "device.qr.changed": { token: string; qrcode: string | undefined };
  "device.contact.changed": { token: string; contact: Device["contact"] };

  "notifications.changed": NotificationsType[];

  "widget.changed": { isOpen: boolean };
  "widget.buttonPosition.changed": { x: number; y: number };

  "theme.changed": Theme;

  "position.changed": { x: number; y: number };

  "settings.changed": {
    showNotifications: boolean;
    showSettings: boolean;
    showDevices: boolean;
    showAddDevices: boolean;
    showEnableDevices: boolean;
    showRemoveDevices: boolean;
    showWidgetButton: boolean;
  };

  "fx.ringtone.start": void;
  "fx.ringtone.stop": void;
  "fx.pip.enable": void;
  "fx.pip.disable": void;
  "fx.unloadConfirm.enable": void;
  "fx.unloadConfirm.disable": void;
  "fx.screen.set": ACLScreen;
  "fx.widget.open": void;
  "fx.widget.restore": { isClosed: boolean };
};

export type EventType = keyof EventMap;
export type EventPayload<T extends EventType> = EventMap[T];

export type RequestMap = {
  "call.start": {
    payload: { to: string; fromTokens?: string[]; displayName?: string };
    result:
      | { call: null; err: { message: string; devices: { token: string; reason: string }[] } }
      | { call: { id: string; peer: CallActiveProps["peer"] }; err: null };
  };
  "offer.accept": {
    payload: { id: string };
    result:
      | { call: null; err: { message: string } }
      | { call: { id: string; peer: CallActiveProps["peer"] }; err: null };
  };
  "offer.reject": {
    payload: { id: string };
    result: { err: null } | { err: { message: string } };
  };
  "theme.set": {
    payload: { theme: Theme };
    result: void;
  };
  "widget.setIsClosed": {
    payload: { isClosed: boolean };
    result: void;
  };
  "widget.open": {
    payload: void;
    result: void;
  };
  "widget.close": {
    payload: void;
    result: void;
  };
  "widget.toggle": {
    payload: void;
    result: void;
  };
  "widget.buttonPosition.set": {
    payload: { value: { x: number; y: number } };
    result: void;
  };
  "position.set": {
    payload: { value: { x: number; y: number } };
    result: void;
  };
  "settings.setShowNotifications": { payload: { value: boolean }; result: void };
  "settings.setShowSettings": { payload: { value: boolean }; result: void };
  "settings.setShowDevices": { payload: { value: boolean }; result: void };
  "settings.setShowAddDevices": { payload: { value: boolean }; result: void };
  "settings.setShowEnableDevices": { payload: { value: boolean }; result: void };
  "settings.setShowRemoveDevices": { payload: { value: boolean }; result: void };
  "settings.setShowWidgetButton": { payload: { value: boolean }; result: void };
  "notifications.add": { payload: { notification: NotificationsType }; result: void };
  "notifications.remove": { payload: { id: Date }; result: void };
  "notifications.clear": { payload: void; result: void };
  "notifications.read": { payload: void; result: void };
  "device.add": { payload: { token: string; persist?: boolean }; result: void };
  "device.remove": { payload: { token: string }; result: void };
  "device.enable": { payload: { token: string }; result: void };
  "device.disable": { payload: { token: string }; result: void };
};

export type RequestType = keyof RequestMap;
export type RequestPayload<T extends RequestType> = RequestMap[T]["payload"];
export type RequestResult<T extends RequestType> = RequestMap[T]["result"];

export type QueryMap = {
  "call.active": CallActiveProps | undefined;
  "call.outgoing": CallOutgoingProps | undefined;
  "call.status": CallStatus;
  "call.peerMuted": boolean;
  "call.offers": CallOfferProps[];
  "device.list": DeviceState[];
  "notifications.list": NotificationsType[];
  "widget.isOpen": boolean;
  "widget.buttonPosition": { x: number; y: number };
  "theme.value": Theme;
  "position.value": { x: number; y: number };
  "settings.showNotifications": boolean;
  "settings.showSettings": boolean;
  "settings.showDevices": boolean;
  "settings.showAddDevices": boolean;
  "settings.showEnableDevices": boolean;
  "settings.showRemoveDevices": boolean;
  "settings.showWidgetButton": boolean;
  "settings.buttonPosition": WidgetButtonPosition;
  "settings.position": WebphonePosition;
};

export type QueryType = keyof QueryMap;
export type QueryResult<T extends QueryType> = QueryMap[T];
