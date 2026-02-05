import type { EventType, Handler, WildcardHandler } from "mitt";

import mitt from "mitt";

export type GlobalEvents = {
    error: { source: string; error: any; },
};

class EventBus<Events extends Record<EventType, unknown>> implements IEventBus<Events> {
    private readonly _emitter = mitt<Events>();

    get all() { return this._emitter.all; }

    set<NewEventSet extends Record<EventType, unknown>>(): IEventBus<NewEventSet> {
        return this as unknown as IEventBus<NewEventSet>;
    }

    on(type: "*", handler: WildcardHandler<Events>): IEventBus<Events>;
    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): IEventBus<Events>;
    on(type: any, handler: any): IEventBus<Events> {
        this._emitter.on(type, handler);
        return this;
    }

    off(type: "*", handler: WildcardHandler<Events>): IEventBus<Events>;
    off<Key extends keyof Events>(name: Key, handler: Handler<Events[Key]>): IEventBus<Events>;
    off(type: any, handler: any): IEventBus<Events> {
        this._emitter.off(type, handler);
        return this;
    }

    emit<Key extends keyof Events>(name: Key, data?: Events[Key]): IEventBus<Events> {
        this._emitter.emit(name, data ?? (void 0 as any));
        return this;
    }

}

export const events: IEventBus<GlobalEvents> = new EventBus();
