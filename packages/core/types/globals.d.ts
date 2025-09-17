declare global {
    declare type LogFunction = (...data: any[]) => void;

    declare interface ILogger {
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

    declare const log: LogFunction & ILogger;
    declare const LOG: ClassMethodDecoratorFunction;
}

declare var window: Window & typeof globalThis;
declare var globalThis: Global & typeof globalThis;

export { };
