import type {
  ActiveCall,
  CallPeer,
  CommandFailure,
  DeviceAttempt,
  IncomingCall,
  OutgoingCall,
  Result,
  StartCallFailure,
  Wavoip,
} from "@wavoip/wavoip-api/web";
import { type NotificationsController, newId } from "@/middleware/controllers/NotificationsController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { IgnorableOffer, OfferOutcome } from "@/middleware/store/slices/callSlice";

type Deps = { wavoip: Wavoip; store: MiddlewareStoreApi; notifications: NotificationsController };

export type StartCallSuccess = { call: { id: string; peer: CallPeer }; err: null };
export type StartCallRejection = {
  call: null;
  err: { message: string; devices: { token: string; reason: string }[] };
};
export type StartCallResult = StartCallSuccess | StartCallRejection;

/**
 * A v3 não devolve texto legível: o `code` é o contrato, e é ele que vira `message` aqui.
 * O formato `{call, err}` é da API pública do webphone (`window.wavoip.call.start`) e não
 * acompanha o `Result` da lib — mudá-lo quebraria quem integra.
 */
function toRejection(error: StartCallFailure): StartCallRejection {
  return {
    call: null,
    err: {
      message: error.code,
      devices: error.devices.map((d) => ({ token: d.token, reason: d.error.code })),
    },
  };
}

export class CallController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  async start(to: string, config: { fromTokens?: string[] } = {}): Promise<StartCallResult> {
    const fromTokens = config.fromTokens ?? this.enabledTokens();

    const { data: call, error } = await this.deps.wavoip.startCall({ fromTokens, to });
    if (error) return toRejection(error);

    this.bindOutgoing(call);
    const { store } = this.deps;
    store.getState().setCallFailReason(undefined);
    store.getState().setOutgoing(call);
    store.getState().setCallStatus("CALLING");

    return { call: { id: call.id, peer: call.peer }, err: null };
  }

  /**
   * O status vira assim que a chamada é entregue: a wavoip-api não emite o evento
   * terminal localmente, só quando o servidor confirma, e a UI ficaria parada na
   * duração correndo até a volta do WSS.
   */
  /**
   * Desligar não emite evento público — o fim que o usuário causou ele já conhece —, por
   * isso o espelho é explícito aqui em vez de vir de um handler.
   */
  async end(): Promise<Result<void, CommandFailure>> {
    const { store } = this.deps;
    const { active, outgoing } = store.getState();
    if (!active) return outgoing ? this.cancel() : { data: undefined, error: null };

    const result = await active.end();
    this.mirror(active);
    return result;
  }

  /**
   * Diferente de desligar uma chamada ativa, cancelar pode falhar de verdade: o peer
   * pode atender no mesmo instante, e o servidor recusa com IS_NOT_OFFER.
   *
   * Por isso o status só é gravado depois da confirmação do servidor. Marcar terminal
   * antes e desfazer na falha não funciona: status terminal arma todos os efeitos
   * terminais — o timer que apaga a chamada, o `call:ended` público — e desfazer depois
   * não desarma o que já disparou. O "cancelando" é do botão, e não do status.
   */
  async cancel(callId?: string): Promise<Result<void, CommandFailure>> {
    const { store } = this.deps;
    const { outgoing } = store.getState();
    if (!outgoing) return { data: undefined, error: null };
    // Um abort atrasado não pode cancelar o que estiver no store a essa altura — o
    // operador pode já ter discado de novo.
    if (callId !== undefined && outgoing.id !== callId) return { data: undefined, error: null };

    // Três desfechos, não dois. `ok`: a lib já pôs `CANCELLED` antes de resolver, então
    // espelhar basta. `CALL_ALREADY_ANSWERED`: a chamada continua viva e o `accepted`
    // vem — não há o que gravar. `ACK_TIMEOUT`: o servidor pode não ter visto, o outro
    // lado pode estar tocando, e a mídia foi mantida de propósito; inventar status aqui
    // seria mentir para a tela.
    const result = await outgoing.cancel();
    if (result.error === null) this.mirror(outgoing);
    return result;
  }

  /**
   * Disca, contando o andamento pelo store (`dialStatus`, `dialError`, `dialIsLoading`).
   *
   * Quem percorre os devices é a lib: o `startCallIterator` tenta um por vez e entrega
   * cada recusa enquanto acontece. O webphone já reimplementou esse laço uma vez, com
   * uma chamada de `startCall` por token — e reimplementar o que a lib faz foi o que
   * deixou códigos de erro da v2 sobreviverem aqui.
   *
   * O que é nosso é só a desistência. O `dialToken` vive no store porque o
   * Picture-in-Picture monta um segundo teclado, e um contador por instância deixaria o
   * botão de abortar de uma sem efeito sobre o laço da outra.
   */
  async dial(to: string, tokens: string[]): Promise<void> {
    const { store } = this.deps;
    store.getState().bumpDialToken();
    const dialToken = store.getState().dialToken;
    const desistiu = () => dialToken !== store.getState().dialToken;

    store.getState().setDialIsLoading(true);
    store.getState().setDialError("");
    store.getState().setDialStatus("");

    const attempts = this.deps.wavoip.startCallIterator({ fromTokens: tokens, to });

    let step = await attempts.next();
    while (!step.done) {
      // Parar de consumir é o que aborta: o gerador fica suspenso no `yield` e nenhum
      // outro device é tentado.
      if (desistiu()) return;
      this.reportAttempt(step.value, to);
      step = await attempts.next();
    }

    const { data: call, error } = step.value;

    // Desistiu enquanto o último device era tentado: se a chamada chegou a existir, o
    // cancelamento vai pelo id, para não cancelar uma discagem começada nesse meio-tempo.
    if (desistiu()) {
      if (call) void this.cancel(call.id);
      return;
    }

    if (call) {
      this.bindOutgoing(call);
      store.getState().setCallFailReason(undefined);
      store.getState().setOutgoing(call);
      this.mirror(call);
      store.getState().pushRecentNumber(to);
      store.getState().setKeyboardInput("");
      store.getState().setDialStatus("");
      store.getState().setDialIsLoading(false);
      return;
    }

    store.getState().setDialError(error.code);
    store.getState().setDialStatus("");
    store.getState().setDialIsLoading(false);
  }

  /** Desiste da discagem em curso; o laço percebe entre um device e o próximo. */
  abortDial(): void {
    const { store } = this.deps;
    store.getState().bumpDialToken();
    store.getState().setDialIsLoading(false);
    store.getState().setDialStatus("");
  }

  private reportAttempt(attempt: DeviceAttempt, to: string): void {
    this.deps.store.getState().setDialStatus(attempt.token);
    this.deps.notifications.add({
      id: newId(),
      created_at: new Date(),
      type: "CALL_FAILED",
      detail: `${attempt.token} -> ${to}`,
      message: attempt.error.code,
      token: attempt.token,
      isRead: false,
      isHidden: false,
    });
  }

  ingestOffer(offer: IncomingCall): void {
    this.deps.store.getState().addOffer(this.wrapOffer(offer));
    offer.on("ended", () => this.dropOffer(offer.id));
    offer.on("acceptedElsewhere", () => this.dropOfferWithOutcome(offer.id, "elsewhere"));
    offer.on("rejectedElsewhere", () => this.dropOfferWithOutcome(offer.id, "elsewhere"));
    offer.on("cancelled", () => this.dropOffer(offer.id));
  }

  private wrapOffer(offer: IncomingCall): IgnorableOffer {
    const originalAccept = offer.accept.bind(offer);
    const originalReject = offer.reject.bind(offer);
    return new Proxy(offer, {
      get: (target, prop, receiver) => {
        if (prop === "accept") {
          return async () => {
            const result = await originalAccept();
            if (result.data) this.promoteToActive(result.data, offer.id);
            return result;
          };
        }
        // O offer.reject() da wavoip-api não emite "ended" localmente, só quando o
        // servidor confirma. Tirar a oferta na hora faz o toque parar na hora.
        if (prop === "reject") {
          return async () => {
            const result = await originalReject();
            if (!result.error) this.dropOfferWithOutcome(offer.id, "rejected");
            return result;
          };
        }
        // "ignore" não existe na wavoip-api e nunca chega ao servidor: tira a oferta
        // pelo mesmo caminho de "ended"/"unanswered", então ela conta como perdida,
        // como num telefone de verdade. A guarda cobre uma chamada atrasada (a limpeza
        // do toast depois de aceitar/recusar), que não pode reprocessar uma oferta que
        // já saiu.
        if (prop === "ignore") {
          return () => {
            const stillPending = this.deps.store.getState().offers.some((o) => o.id === offer.id);
            if (stillPending) this.dropOffer(offer.id);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as IgnorableOffer;
  }

  private promoteToActive(call: ActiveCall, offerId: string): void {
    const { store } = this.deps;
    store.getState().markOfferOutcome(offerId, "accepted");
    store.getState().removeOffer(offerId);
    this.bindActive(call);
    store.getState().setActive(call);
    store.getState().setCallStatus("ACTIVE");
    store.getState().setPeerMuted(call.peer.muted ?? false);
  }

  private dropOffer(id: string): void {
    this.deps.store.getState().removeOffer(id);
  }

  private dropOfferWithOutcome(id: string, outcome: OfferOutcome): void {
    this.deps.store.getState().markOfferOutcome(id, outcome);
    this.deps.store.getState().removeOffer(id);
  }

  /**
   * O `status` da lib é a fonte da verdade e está sempre atual dentro de qualquer
   * handler — o `settle` do servidor roda antes do `announce`. Espelhar é o que a v3
   * pede: reconstruir a máquina de estado aqui fora era a v2 sobrevivendo, e cada
   * transição chapada é uma chance de divergir da lib.
   */
  private mirror(call: OutgoingCall | ActiveCall): void {
    this.deps.store.getState().setCallStatus(call.status);
  }

  private bindOutgoing(call: OutgoingCall): void {
    const { store } = this.deps;
    const mirror = () => this.mirror(call);

    call.on("ringing", mirror);
    call.on("rejected", mirror);
    call.on("unanswered", mirror);
    call.on("ended", mirror);
    call.on("failed", (error) => {
      store.getState().setCallFailReason(error.code);
      mirror();
    });
    call.on("accepted", (active) => {
      store.getState().setOutgoing(undefined);
      this.bindActive(active);
      store.getState().setActive(active);
      this.mirror(active);
      store.getState().setPeerMuted(active.peer.muted ?? false);
    });
  }

  private bindActive(call: ActiveCall): void {
    const { store } = this.deps;
    const mirror = () => this.mirror(call);

    call.on("ended", mirror);
    call.on("peerMuteChanged", (muted) => store.getState().setPeerMuted(muted));
    call.on("failed", (error) => {
      store.getState().setCallFailReason(error.code);
      mirror();
    });
    // Perna de mídia e estado da chamada são fatos diferentes, e só o servidor decide o
    // segundo: a lib grava `DISCONNECTED` quando ele avisa, e deixa o status quieto
    // quando é só o transporte piscando. Espelhar acerta os dois — derivar do payload
    // pintaria queda toda vez que a mídia parasse, inclusive ao desligar daqui.
    call.on("connectionChanged", mirror);
  }

  /** O motivo vem como `code`: a v3 não devolve texto legível, e quem traduz é o `i18n`. */
  private failWith(code: string): void {
    const { store } = this.deps;
    store.getState().setCallFailReason(code);
    store.getState().setCallStatus("FAILED");
  }

  private enabledTokens(): string[] {
    return this.deps.store
      .getState()
      .devices.filter((d) => d.enable)
      .map((d) => d.token);
  }
}
