import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { CallOutgoing } from "@wavoip/wavoip-api";
import { beforeEach, describe, expect, it } from "vitest";
import { FakeCallOutgoing, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";
import KeyboardScreen from "@/screens/KeyboardScreen";

type StartCallParams = { fromTokens?: string[]; to: string };
type StartCallResult =
  | { call: CallOutgoing; err: null }
  | { call: null; err: { message: string; devices: { token: string; reason: string }[] } };

/**
 * Hands the test control over when each `startCall` settles, so the abort can be
 * clicked while a device is still being tried — the only window where it matters.
 */
function deferredStartCall(wavoip: FakeWavoip) {
  const attempts: string[] = [];
  const pending: ((result: StartCallResult) => void)[] = [];

  wavoip.startCall = ((params: StartCallParams) => {
    attempts.push(params.fromTokens?.[0] ?? "");
    return new Promise<StartCallResult>((resolve) => pending.push(resolve));
  }) as FakeWavoip["startCall"];

  return {
    attempts,
    // A generic reason on purpose: `PHONE_DONT_EXIST` and `NO_DEVICES_FOUND` end the
    // queue by design, so neither would exercise the walk to the next device.
    failLast: () =>
      pending.pop()?.({ call: null, err: { message: "BUSY", devices: [{ token: "tok-1", reason: "BUSY" }] } }),
    succeedLast: (call: CallOutgoing) => pending.pop()?.({ call, err: null }),
  };
}

async function dial(number = "5511999999999") {
  const wavoip = new FakeWavoip();
  const control = deferredStartCall(wavoip);
  const { rendered, api } = await renderWithProviders({ wavoip, children: <KeyboardScreen /> });

  // The dial loop walks the *store's* enabled devices, not the SDK's — and a device
  // is only born enabled when its status is already "open".
  act(() => {
    for (const token of ["tok-1", "tok-2"]) {
      api.device.add(token, false);
      api.device.enable(token);
    }
  });

  const input = rendered.container.querySelector("input") as HTMLInputElement;
  fireEvent.change(input, { target: { value: number } });
  fireEvent.submit(input.closest("form") as HTMLFormElement);

  return { wavoip, control, rendered };
}

/**
 * The dial loop tries the enabled devices one at a time and, until now,
 * offered no way out: the dial button was simply disabled while it ran. With
 * several devices the wait is long enough to matter.
 */
describe("KeyboardScreen dial abort", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
  });

  it("stops trying the remaining devices once the user gives up", async () => {
    const { control } = await dial();
    await waitFor(() => expect(control.attempts).toEqual(["tok-1"]));

    fireEvent.click(screen.getByLabelText("Desistir"));
    // Settling inside `act` drains the promise chain, so a recursion that was
    // going to happen has already happened by the assertion — otherwise `waitFor`
    // passes on its first check, before the loop ever had the chance to move on.
    await act(async () => {
      control.failLast();
    });

    expect(control.attempts).toEqual(["tok-1"]);
  });

  it("keeps walking the devices when the user does not give up", async () => {
    const { control } = await dial();
    await waitFor(() => expect(control.attempts).toEqual(["tok-1"]));

    control.failLast();

    await waitFor(() => expect(control.attempts).toEqual(["tok-1", "tok-2"]));
  });

  // A call that lands after the abort is already bound to the controller, so
  // leaving it alone would ring the callee for a dial the user walked away from.
  it("cancels a call that arrives after the abort", async () => {
    const { control } = await dial();
    await waitFor(() => expect(control.attempts).toEqual(["tok-1"]));
    const call = new FakeCallOutgoing("c1", "tok-1");

    fireEvent.click(screen.getByLabelText("Desistir"));
    control.succeedLast(call as unknown as CallOutgoing);

    await waitFor(() => expect(call.cancelCalls).toBe(1));
  });
});
