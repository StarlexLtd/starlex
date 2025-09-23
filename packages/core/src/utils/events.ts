import type { Handler } from "mitt";

import mitt from "mitt";

export type GlobalEvents = {
    error: { source: string; error: any; },
};

class EventBus<Events extends BaseEvents> implements IEventBus<Events> {
    private readonly _emitter = mitt<Events>();

    get all() { return this._emitter.all; }

    set<NewEventSet extends BaseEvents>(): IEventBus<NewEventSet> {
        return this as unknown as IEventBus<NewEventSet>;
    }

    on<Key extends keyof Events>(name: Key, handler: Handler<Events[Key]>): IEventBus<Events> {
        this._emitter.on(name, handler);
        return this;
    }

    off<Key extends keyof Events>(name: Key, handler: Handler<Events[Key]>): IEventBus<Events> {
        this._emitter.off(name, handler);
        return this;
    }

    emit<Key extends keyof Events>(name: Key, data?: Events[Key]): IEventBus<Events> {
        this._emitter.emit(name, data ?? (void 0 as any));
        return this;
    }

}

export const events: IEventBus<GlobalEvents> = new EventBus();
