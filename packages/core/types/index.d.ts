declare global {
    declare type LogFunction = (...data: any[]) => void;

    declare interface ILogger {
        error: LogFunction;
        warn: LogFunction;
        info: LogFunction;
        debug: LogFunction;
        trace: LogFunction;
    }

    var TRACE: boolean;
    var DEBUG: boolean;
    var RELEASE: boolean;
    
    declare const log: LogFunction & ILogger;
    declare const LOG: ClassMethodDecoratorFunction;
}

declare var globalThis: Global & typeof globalThis;
// declare const log: LogFunction & ILogger;

export { };
