import { MiddlewarePipeline } from "@/middleware/pipeline/MiddlewarePipeline";
import type { Middleware, MiddlewareEvent, MiddlewareEventMap } from "@/middleware/pipeline/types";

type Pipelines = {
  [E in MiddlewareEvent]: MiddlewarePipeline<MiddlewareEventMap[E]>;
};

/** Evento novo: estenda o {@link MiddlewareEventMap} e registre o pipeline aqui. */
export class MiddlewareRegistry {
  private readonly pipelines: Pipelines = {
    offer: new MiddlewarePipeline(),
  };

  use<E extends MiddlewareEvent>(event: E, fn: Middleware<MiddlewareEventMap[E]>): void {
    this.pipelineFor(event).use(fn);
  }

  async run<E extends MiddlewareEvent>(event: E, payload: MiddlewareEventMap[E]): Promise<boolean> {
    return this.pipelineFor(event).run(payload);
  }

  private pipelineFor<E extends MiddlewareEvent>(event: E): MiddlewarePipeline<MiddlewareEventMap[E]> {
    const pipeline = this.pipelines[event];
    if (!pipeline) {
      const supported = Object.keys(this.pipelines).join(", ");
      throw new Error(`Unknown middleware event "${event}". Supported events: ${supported}`);
    }
    return pipeline;
  }
}
