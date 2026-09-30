import type { DeviceAttempt, OutgoingCall, Result, StartCallFailure } from "@wavoip/wavoip-api/web";
import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, screen, waitFor } from "@/middleware/testing/dom";
import { FakeOutgoingCall, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";
import KeyboardScreen from "@/screens/KeyboardScreen";

type StartCallParams = { fromTokens?: string[]; to: string };
type StartCallResult = Result<OutgoingCall, StartCallFailure>;
/** Genérico de propósito: um motivo que encerrasse a fila não exercitaria o próximo device. */
const BUSY = { code: "DEVICE_BUSY" } as const;

/**
 * Dublê do `startCallIterator`: anda pelos tokens que o webphone mandou, um por vez, e
 * só decide o device da vez quando o teste manda. Parar de consumir é o que aborta — o
 * gerador fica suspenso no `yield` e o próximo token nunca é tentado.
 */
class ControlledDialer {
  readonly tried: string[] = [];
  private decide: ((call: OutgoingCall | null) => void) | null = null;

  constructor(wavoip: FakeWavoip) {
    wavoip.startCallIterator = ((params: StartCallParams) =>
      this.walk(params.fromTokens ?? [])) as FakeWavoip["startCallIterator"];
  }

  failCurrent(): void {
    this.decide?.(null);
  }

  succeedCurrent(call: OutgoingCall): void {
    this.decide?.(call);
  }

  private async *walk(tokens: string[]): AsyncGenerator<DeviceAttempt, StartCallResult> {
    for (const token of tokens) {
      this.tried.push(token);
      const call = await new Promise<OutgoingCall | null>((resolve) => {
        this.decide = resolve;
      });
      if (call) return { data: call, error: null };
      yield { token, error: BUSY } as unknown as DeviceAttempt;
    }
    return { data: null, error: { code: "DEVICE_BUSY", devices: [] } as unknown as StartCallFailure };
  }
}

async function dial(number = "5511999999999") {
  const wavoip = new FakeWavoip();
  const dialer = new ControlledDialer(wavoip);
  const { rendered, api } = await renderWithProviders({ wavoip, children: () => <KeyboardScreen /> });

  // O loop anda pelos devices habilitados do *store*, e não do SDK — e um device só
  // nasce habilitado com o status já em "open".
  act(() => {
    for (const token of ["tok-1", "tok-2"]) {
      api.device.add(token, false);
      api.device.enable(token);
    }
  });

  const input = rendered.container.querySelector("input") as HTMLInputElement;
  // `input`, e não `change`: quem alimenta o store é o `onInput` da tela.
  fireEvent.input(input, { target: { value: number } });
  fireEvent.submit(input.closest("form") as HTMLFormElement);

  return { wavoip, dialer, rendered };
}

describe("KeyboardScreen dial abort", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
  });

  it("stops trying the remaining devices once the user gives up", async () => {
    const { dialer } = await dial();
    await waitFor(() => expect(dialer.tried).toEqual(["tok-1"]));

    fireEvent.click(screen.getByLabelText("Desistir"));
    // Resolver dentro do `act` esvazia a cadeia de promises, então o passo que ia
    // acontecer já aconteceu na asserção — senão ela passa antes de o laço ter chance
    // de andar.
    await act(async () => {
      dialer.failCurrent();
    });

    expect(dialer.tried).toEqual(["tok-1"]);
  });

  it("keeps walking the devices when the user does not give up", async () => {
    const { dialer } = await dial();
    await waitFor(() => expect(dialer.tried).toEqual(["tok-1"]));

    dialer.failCurrent();

    await waitFor(() => expect(dialer.tried).toEqual(["tok-1", "tok-2"]));
  });

  it("cancels a call that arrives after the abort", async () => {
    const { dialer } = await dial();
    await waitFor(() => expect(dialer.tried).toEqual(["tok-1"]));
    const call = new FakeOutgoingCall("c1", "tok-1");

    fireEvent.click(screen.getByLabelText("Desistir"));
    dialer.succeedCurrent(call as unknown as OutgoingCall);

    await waitFor(() => expect(call.cancelCalls).toBe(1));
  });
});
