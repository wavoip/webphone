import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CallButtons } from "@/components/CallButtons";
import { FakeCallActive, FakeCallOutgoing, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";

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

const hangUp = () => screen.getByRole("button", { name: /cancelar|finalizar/i }) as HTMLButtonElement;

describe("CallButtons hang-up", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
  });

  it("offers to cancel — not to end — a call that was never answered", async () => {
    await withOutgoing();

    expect(hangUp().getAttribute("aria-label")).toBe("Cancelar");
  });

  it("cancels the outgoing call and reports progress while the server has not answered", async () => {
    const { outgoing } = await withOutgoing();

    fireEvent.click(hangUp());

    await waitFor(() => expect(outgoing.cancelCalls).toBe(1));
  });

  it("comes back when the server refuses the cancellation", async () => {
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    outgoing.cancelResult = { err: "IS_NOT_OFFER" };
    await withOutgoing(outgoing);

    fireEvent.click(hangUp());

    await waitFor(() => expect(hangUp().disabled).toBe(false));
  });

  it("says 'end', not 'cancel', once the call is connected", async () => {
    const active = new FakeCallActive("c1", "tok-1");
    await renderWithProviders({ children: <CallButtons call={active} /> });

    expect(hangUp().getAttribute("aria-label")).toBe("Finalizar");
  });
});
