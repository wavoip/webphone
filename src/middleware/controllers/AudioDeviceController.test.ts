import { beforeEach, describe, expect, it } from "vitest";
import { AudioDeviceController } from "@/middleware/controllers/AudioDeviceController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";

const mic = (id: string): MediaDeviceInfo =>
  ({ deviceId: id, kind: "audioinput", label: id, groupId: "g", toJSON: () => ({}) }) as MediaDeviceInfo;
const spk = (id: string): MediaDeviceInfo =>
  ({ deviceId: id, kind: "audiooutput", label: id, groupId: "g", toJSON: () => ({}) }) as MediaDeviceInfo;

describe("AudioDeviceController", () => {
  let store: MiddlewareStoreApi;
  let wavoip: FakeWavoip;
  let controller: AudioDeviceController;

  beforeEach(() => {
    localStorage.clear();
    wavoip = new FakeWavoip();
    store = createMiddlewareStore();
    controller = new AudioDeviceController({ wavoip: wavoip.asWavoip(), store });
  });

  describe("hydrate", () => {
    it("seeds store with SDK permission and devices", () => {
      wavoip.micPermission = "granted";
      wavoip.multimediaDevices = [mic("m1"), spk("s1")];

      controller.hydrate();

      expect(store.getState().micPermission).toBe("granted");
      expect(store.getState().availableAudio.mics.map((d) => d.deviceId)).toEqual(["m1"]);
      expect(store.getState().availableAudio.speakers.map((d) => d.deviceId)).toEqual(["s1"]);
    });

    it("restores persisted mic and pushes to SDK when present", () => {
      localStorage.setItem("wavoip:audio", JSON.stringify({ micId: "m1", speakerId: "s1" }));
      wavoip.multimediaDevices = [mic("m1"), spk("s1")];

      controller.hydrate();

      expect(store.getState().selectedMicId).toBe("m1");
      expect(store.getState().selectedSpeakerId).toBe("s1");
      expect(wavoip.setMicrophoneCalls).toEqual(["m1"]);
    });

    it("restores persisted mic but skips SDK push when device is missing", () => {
      localStorage.setItem("wavoip:audio", JSON.stringify({ micId: "ghost", speakerId: null }));

      controller.hydrate();

      expect(store.getState().selectedMicId).toBe("ghost");
      expect(wavoip.setMicrophoneCalls).toEqual([]);
    });

    it("subscribes to onDevicesChanged and writes the snapshot to store", () => {
      controller.hydrate();
      wavoip.emitDevicesChanged([mic("m2"), spk("s2")]);

      expect(store.getState().availableAudio.mics.map((d) => d.deviceId)).toEqual(["m2"]);
      expect(store.getState().availableAudio.speakers.map((d) => d.deviceId)).toEqual(["s2"]);
    });

    it("subscribes to onMicrophonePermissionChanged and forwards the state", () => {
      controller.hydrate();
      wavoip.emitMicrophonePermissionChanged("granted");

      expect(store.getState().micPermission).toBe("granted");
    });
  });

  describe("setMicrophone", () => {
    it("updates store and forwards to SDK", async () => {
      const result = await controller.setMicrophone("mic-a");
      expect(result).toEqual({ err: null });
      expect(store.getState().selectedMicId).toBe("mic-a");
      expect(wavoip.setMicrophoneCalls).toEqual(["mic-a"]);
    });

    it("returns SDK error verbatim on failure", async () => {
      wavoip.setMicrophoneResult = { err: "Microphone device not found: mic-x" };
      const result = await controller.setMicrophone("mic-x");
      expect(result.err).toMatch(/not found/);
    });
  });

  describe("setSpeaker", () => {
    it("writes selection to store", () => {
      controller.setSpeaker("spk-a");
      expect(store.getState().selectedSpeakerId).toBe("spk-a");
    });
  });

  describe("requestPermission", () => {
    it("forwards to SDK and resolves with the resulting state", async () => {
      wavoip.requestMicrophonePermissionResult = "granted";
      const state = await controller.requestPermission();
      expect(state).toBe("granted");
    });
  });

  describe("ensureDefaults", () => {
    it("selects the system default mic and speaker when no persisted selection exists", () => {
      const defaultMic = {
        deviceId: "default",
        kind: "audioinput",
        label: "Default - Mic",
        groupId: "g",
        toJSON: () => ({}),
      } as MediaDeviceInfo;
      const otherMic = mic("mic-b");
      const defaultSpk = {
        deviceId: "default",
        kind: "audiooutput",
        label: "Default - Speakers",
        groupId: "g",
        toJSON: () => ({}),
      } as MediaDeviceInfo;
      wavoip.multimediaDevices = [defaultMic, otherMic, defaultSpk, spk("spk-b")];

      controller.hydrate();

      expect(store.getState().selectedMicId).toBe("default");
      expect(store.getState().selectedSpeakerId).toBe("default");
      expect(wavoip.setMicrophoneCalls).toEqual(["default"]);
    });

    it("falls back to the first device when no 'default' entry is present", () => {
      wavoip.multimediaDevices = [mic("mic-a"), mic("mic-b"), spk("spk-a")];

      controller.hydrate();

      expect(store.getState().selectedMicId).toBe("mic-a");
      expect(store.getState().selectedSpeakerId).toBe("spk-a");
    });

    it("does not override a persisted selection that still exists", () => {
      localStorage.setItem("wavoip:audio", JSON.stringify({ micId: "mic-b", speakerId: null }));
      wavoip.multimediaDevices = [mic("mic-a"), mic("mic-b"), spk("spk-a")];

      controller.hydrate();

      expect(store.getState().selectedMicId).toBe("mic-b");
    });

    it("re-picks a default when the previously selected device is unplugged", () => {
      controller.hydrate();
      wavoip.emitDevicesChanged([mic("mic-a"), spk("spk-a")]);
      expect(store.getState().selectedMicId).toBe("mic-a");

      wavoip.emitDevicesChanged([mic("mic-b"), spk("spk-b")]);
      expect(store.getState().selectedMicId).toBe("mic-b");
      expect(store.getState().selectedSpeakerId).toBe("spk-b");
    });

    it("skips empty deviceId entries (insecure context placeholders)", () => {
      const blank = { deviceId: "", kind: "audioinput", label: "", groupId: "", toJSON: () => ({}) } as MediaDeviceInfo;
      wavoip.multimediaDevices = [blank];

      controller.hydrate();

      expect(store.getState().selectedMicId).toBeNull();
    });
  });

  describe("refresh", () => {
    it("forwards to wavoip.refreshMultimediaDevices and lets the subscription update the store", async () => {
      controller.hydrate();
      wavoip.multimediaDevices = [mic("m1"), spk("s1")];

      await controller.refresh();

      expect(wavoip.refreshMultimediaDevicesCalls).toBe(1);
      expect(store.getState().availableAudio.mics.map((d) => d.deviceId)).toEqual(["m1"]);
    });
  });

  describe("destroy", () => {
    it("unsubscribes from SDK events", () => {
      controller.hydrate();
      controller.destroy();
      wavoip.emitDevicesChanged([mic("m3")]);
      expect(store.getState().availableAudio.mics).toEqual([]);
    });
  });
});
