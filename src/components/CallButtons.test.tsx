import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CallButtons } from "@/components/CallButtons";
import { FakeCallActive, FakeCallOutgoing, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";

/** Puts an outgoing call in the store and renders the buttons bound to it. */
async function withOutgoing(outgoing = new FakeCallOutgoing("c1", "tok-1")) {
  const wavoip = new FakeWavoip(["tok-1"]);
  wavoip.startCallResult = { call: outgoing, err: null };
  const { api } = await renderWithProviders({
    wavoip,
    children: <CallButtons call={outgoing} />,
  });
  await act(async () => {
    api.device.add("tok-1", false);
    api.device.enable("tok-1");
    await api.call.start("5511999999999");
  });
  return { outgoing };
}

const hangUp = () => screen.getByRole("button", { name: /cancelar|finalizar/i });

describe("CallButtons hang-up", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
  });

  it("offers to cancel — not to end — a call that was never answered", async () => {
    await withOutgoing();

    expect(hangUp()).toHaveAccessibleName("Cancelar");
  });

  it("cancels the outgoing call and reports progress while the server has not answered", async () => {
    const { outgoing } = await withOutgoing();

    fireEvent.click(hangUp());

    await waitFor(() => expect(outgoing.cancelCalls).toBe(1));
  });

  // The button used to lock on the first click and swallow the result, so a refused
  // cancellation — the peer answered in the same instant — stranded the operator on a
  // screen with no way out of a call that was still live.
  it("comes back when the server refuses the cancellation", async () => {
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    outgoing.cancelResult = { err: "IS_NOT_OFFER" };
    await withOutgoing(outgoing);

    fireEvent.click(hangUp());

    await waitFor(() => expect(hangUp()).not.toBeDisabled());
  });

  it("says 'end', not 'cancel', once the call is connected", async () => {
    const active = new FakeCallActive("c1", "tok-1");
    await renderWithProviders({ children: <CallButtons call={active} /> });

    expect(hangUp()).toHaveAccessibleName("Finalizar");
  });
});
