import { Wavoip } from "@wavoip/wavoip-api";
import { describe, expect, it } from "vitest";
import { DeviceController } from "@/middleware/controllers/DeviceController";
import { createMiddlewareStore } from "@/middleware/store/createStore";

describe("DeviceController.hydrate with real Wavoip", () => {
  it("seeds the store with devices passed to the real Wavoip constructor", () => {
    const uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    localStorage.setItem("wavoip:tokens", `${uuid}:true:true`);

    const wavoip = new Wavoip({ tokens: [uuid], platform: "test" });
    const store = createMiddlewareStore();
    const controller = new DeviceController({ wavoip, store });
    controller.hydrate();

    const [device] = store.getState().devices;
    expect(device?.token).toBe(uuid);
    expect(device?.persist).toBe(true);
  });
});
