/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

function getStatus(key: "DEBUG" | "TRACE"): boolean {
    let status = globalThis[key];
    if (typeof window !== "undefined") {
        status ||= window[key];
    }
    if (typeof process !== "undefined") {
        status ||= process.env[key] == "1";
    }

    return status;
}

const __DEBUG = getStatus("DEBUG");
const __TRACE = getStatus("TRACE");

const error = console.error.bind(console);
const warn = console.warn.bind(console);
const info = console.info.bind(console);
const debug = __DEBUG ? console.log.bind(console) : () => { };
const trace = __TRACE ? console.debug.bind(console) : () => { };

const _log = console.log.bind(console) as any;
_log.error = error;
_log.warn = warn;
_log.info = info;
_log.debug = debug;
_log.trace = trace;

export const log: LogFunction & ILogger = _log;
