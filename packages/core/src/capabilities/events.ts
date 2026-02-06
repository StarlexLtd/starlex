import type { EventType, Handler, WildcardHandler } from "mitt";
import type { Capability } from "./base";

import mitt from "mitt";

// export type EventCapability<TEvents extends Record<EventType, unknown>, TBase extends Constructor> = Capability<IEventful<TEvents>, TBase>;

/**
 * Create a new class extends `Base` and add event emitter.
 *
 * @example
 * ```javascript
 * class MyClass extends withEvents<EventType>(baseClass) {}
 * ```
 * @param Base
 * @returns
 */
export function withEvents<TEvents extends Record<EventType, unknown>, TBase extends Constructor = Constructor>(Base: TBase = Object as unknown as TBase)/*: EventCapability<TEvents, TBase>*/ {
    return class EventEnhanced extends Base implements IEventful<TEvents> {
        readonly #emitter = mitt<TEvents>();

        get all() { return this.#emitter.all; }

        on(type: "*", handler: WildcardHandler<TEvents>): IEventful<TEvents>;
        on<Key extends keyof TEvents>(type: Key, handler: Handler<TEvents[Key]>): IEventful<TEvents>;
        on(type: any, handler: any): IEventful<TEvents> {
            this.#emitter.on(type, handler);
            return this;
        }

        off(type: "*", handler: WildcardHandler<TEvents>): IEventful<TEvents>;
        off<Key extends keyof TEvents>(name: Key, handler: Handler<TEvents[Key]>): IEventful<TEvents>;
        off(type: any, handler: any): IEventful<TEvents> {
            this.#emitter.off(type, handler);
            return this;
        }

        emit<Key extends keyof TEvents>(name: Key, data?: TEvents[Key]): IEventful<TEvents> {
            this.#emitter.emit(name, data ?? (void 0 as any));
            return this;
        }
    }/* as unknown as EventCapability<TEvents, TBase>*/;
}
