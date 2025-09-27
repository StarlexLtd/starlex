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

    const withTiming: (this: any, ...args: any) => any;

    // #region Events

    type GlobalEvents = {
        ready: void;
        error: { source: string; error: any; },
    };

    /**
     * Event Bus
     */
    interface IEventBus<Events extends Record<EventType, unknown>> extends Emitter<Events> {
        /**
         * Type cast, for a new sub set of events.
         */
        set<NewEventSet extends Record<EventType, unknown>>(): IEventBus<NewEventSet>;

        /**
         * Attach handler to event.
         * @param type Event type
         * @param handler Event handler
         */
        on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): IEventBus<Events>;
        on(type: "*", handler: WildcardHandler<Events>): void;

        /**
         * Detach handler from event.
         * @param type Event type
         * @param handler Event handler
         */
        off<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): IEventBus<Events>;
        off(type: "*", handler: WildcardHandler<Events>): void;

        /**
         * Emit the event.
         * @param type Event type
         * @param data Attached data
         */
        emit<Key extends keyof Events>(type: Key, data?: Events[Key]): IEventBus<Events>;
        emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void;
    }

    // #endregion
}

declare var window: Window & typeof globalThis;
declare var globalThis: Global & typeof globalThis;

export { };
