import type { EventType, Handler, WildcardHandler } from "mitt";

import mitt from "mitt";

type EventMixin<T extends Constructor, TEvents extends Record<EventType, unknown>> = T & {
    new(...args: any[]): InstanceType<T> & IEventful<TEvents>;
}

export function withEvents<TEvents extends Record<EventType, unknown>, TBase extends Constructor = Constructor>(Base: TBase = class { } as TBase): EventMixin<TBase, TEvents> {
    return class extends Base implements IEventful<TEvents> {
        private readonly _emitter = mitt<TEvents>();

        get all() { return this._emitter.all; }

        on(type: "*", handler: WildcardHandler<TEvents>): IEventful<TEvents>;
        on<Key extends keyof TEvents>(type: Key, handler: Handler<TEvents[Key]>): IEventful<TEvents>;
        on(type: any, handler: any): IEventful<TEvents> {
            this._emitter.on(type, handler);
            return this;
        }

        off(type: "*", handler: WildcardHandler<TEvents>): IEventful<TEvents>;
        off<Key extends keyof TEvents>(name: Key, handler: Handler<TEvents[Key]>): IEventful<TEvents>;
        off(type: any, handler: any): IEventful<TEvents> {
            this._emitter.off(type, handler);
            return this;
        }

        emit<Key extends keyof TEvents>(name: Key, data?: TEvents[Key]): IEventful<TEvents> {
            this._emitter.emit(name, data ?? (void 0 as any));
            return this;
        }
    } as any;
}
