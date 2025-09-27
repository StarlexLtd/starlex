import type { Emitter, EventType, Handler } from "mitt";

declare global {
    type LogFunction = (...data: any[]) => void;

    interface ILogger {
        error: LogFunction;
        warn: LogFunction;
        info: LogFunction;
        debug: LogFunction;
        trace: LogFunction;
    }

    interface Window {
        TRACE: boolean;
        DEBUG: boolean;
        RELEASE: boolean;

        log: LogFunction & ILogger;
    }

    var TRACE: boolean;
    var DEBUG: boolean;
    var RELEASE: boolean;

    const log: LogFunction & ILogger;

    const LOG: (this: any, ...args: any) => any;

    // #region Events

    type BaseEvents = Record<EventType, unknown>;
    type GlobalEvents = {
        error: { source: string; error: any; },
    };

    /**
     * Event Bus
     */
    interface IEventBus<Events extends BaseEvents> extends Emitter<Events> {
        /**
         * Type cast, for a new sub set of events.
         */
        set<NewEventSet extends BaseEvents>(): IEventBus<NewEventSet>;

        /**
         * Attach handler to event.
         * @param name Event name
         * @param handler Event handler
         */
        on<Key extends keyof Events>(name: Key, handler: Handler<Events[Key]>): IEventBus<Events>;

        /**
         * Detach handler from event.
         * @param name Event name
         * @param handler Event handler
         */
        off<Key extends keyof Events>(name: Key, handler: Handler<Events[Key]>): IEventBus<Events>;

        /**
         * Emit the event.
         * @param name Event name
         * @param data Attached data
         */
        emit<Key extends keyof Events>(name: Key, data?: Events[Key]): IEventBus<Events>;
    }

    // #endregion
}

declare var window: Window & typeof globalThis;
declare var globalThis: Global & typeof globalThis;

export { };
