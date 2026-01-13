import type { Emitter, EventType, Handler, WildcardHandler } from "mitt";

declare global {
    type LogFunction = (...data: any[]) => void;

    interface ILogger {
        success: LogFunction;
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

    // const withTiming: (this: any, ...args: any) => any;

    // #region Events

    type GlobalEvents = {
        ready: void;
        error: { source: string; error: any; },
    };

    /**
     * Eventful
     */
    interface IEventful<Events extends Record<EventType, unknown>> extends Emitter<Events> {
        /**
         * Attach handler to event.
         * @param type Event type
         * @param handler Event handler
         */
        on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): IEventful<Events>;
        on(type: "*", handler: WildcardHandler<Events>): IEventful<Events>;

        /**
         * Detach handler from event.
         * @param type Event type
         * @param handler Event handler
         */
        off<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): IEventful<Events>;
        off(type: "*", handler: WildcardHandler<Events>): IEventful<Events>;

        /**
         * Emit the event.
         * @param type Event type
         * @param data Attached data
         */
        emit<Key extends keyof Events>(type: Key, data?: Events[Key]): IEventful<Events>;
        emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): IEventful<Events>;
    }


    /**
     * Event Bus
     */
    interface IEventBus<Events extends Record<EventType, unknown>> extends IEventful<Events> {
        /**
         * Type cast, for a new sub set of events.
         */
        set<NewEventSet extends Record<EventType, unknown>>(): IEventBus<NewEventSet>;
    }

    // #endregion
}

declare var window: Window & typeof globalThis;
declare var globalThis: Global & typeof globalThis;

export { };
