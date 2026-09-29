import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { OutgoingCall, Result, StartCallFailure } from "@wavoip/wavoip-api/web";
import { beforeEach, describe, expect, it } from "vitest";
import { FakeOutgoingCall, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";
import KeyboardScreen from "@/screens/KeyboardScreen";

type StartCallParams = { fromTokens?: string[]; to: string };
type StartCallResult = Result<OutgoingCall, StartCallFailure>;

/** O abort só importa enquanto um device ainda está sendo tentado. */
function deferredStartCall(wavoip: FakeWavoip) {
  const attempts: string[] = [];
  const pending: ((result: StartCallResult) => void)[] = [];

  wavoip.startCall = ((params: StartCallParams) => {
    attempts.push(params.fromTokens?.[0] ?? "");
    return new Promise<StartCallResult>((resolve) => pending.push(resolve));
  }) as FakeWavoip["startCall"];

  return {
    attempts,
    // Motivo genérico de propósito: `PHONE_DONT_EXIST` e `NO_DEVICES_FOUND` encerram a
    // fila, e nenhum dos dois exercitaria a passagem ao próximo device.
    failLast: () =>
      pending.pop()?.({
        data: null,
        error: { code: "DEVICE_BUSY", devices: [{ token: "tok-1", error: { code: "DEVICE_BUSY" } }] },
      }),
    succeedLast: (call: OutgoingCall) => pending.pop()?.({ data: call, error: null }),
  };
}

async function dial(number = "5511999999999") {
  const wavoip = new FakeWavoip();
  const control = deferredStartCall(wavoip);
  const { rendered, api } = await renderWithProviders({ wavoip, children: <KeyboardScreen /> });

  // O loop anda pelos devices habilitados do *store*, e não do SDK — e um device só
  // nasce habilitado com o status já em "open".
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

describe("KeyboardScreen dial abort", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
  });

  it("stops trying the remaining devices once the user gives up", async () => {
    const { control } = await dial();
    await waitFor(() => expect(control.attempts).toEqual(["tok-1"]));

    fireEvent.click(screen.getByLabelText("Desistir"));
    // Resolver dentro do `act` esvazia a cadeia de promises, então a recursão que ia
    // acontecer já aconteceu na asserção — senão o `waitFor` passa na primeira checagem,
    // antes de o loop ter chance de andar.
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

  it("cancels a call that arrives after the abort", async () => {
    const { control } = await dial();
    await waitFor(() => expect(control.attempts).toEqual(["tok-1"]));
    const call = new FakeOutgoingCall("c1", "tok-1");

    fireEvent.click(screen.getByLabelText("Desistir"));
    control.succeedLast(call as unknown as OutgoingCall);

    await waitFor(() => expect(call.cancelCalls).toBe(1));
  });
});
