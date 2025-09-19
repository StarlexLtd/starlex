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
    const LOG: ClassMethodDecoratorFunction<any>;
}

declare var window: Window & typeof globalThis;
declare var globalThis: Global & typeof globalThis;

export { };
