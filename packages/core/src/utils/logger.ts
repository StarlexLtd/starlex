/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import { IS_BROWSER } from "../consts";

const getStatus = (key: "DEBUG" | "TRACE"): boolean =>
    globalThis[key] == true ||
    (typeof window !== "undefined" && (window[key] == true || window.localStorage.getItem(key) == "1" || window.sessionStorage.getItem(key) == "1")) ||
    (typeof process !== "undefined" && process.env[key] == "1");

const __DEBUG = getStatus("DEBUG");
const __TRACE = getStatus("TRACE");

const chalkText = chalk.whiteBright;
const successPrefix = chalkText.bgHex(IS_BROWSER ? "#14A44D" : "#15803D")(" SUCCESS ");
const errorPrefix   = chalkText.bgHex(IS_BROWSER ? "#DC4C64" : "#DC2626")("  ERROR  ");
const warnPrefix    = chalkText.bgHex(IS_BROWSER ? "#E4A11B" : "#B45309")(" WARNING ");
const infoPrefix    = chalkText.bgHex(IS_BROWSER ? "#54B4D3" : "#0E7490")("  INFO   ");
const debugPrefix   = chalkText.bgHex(IS_BROWSER ? "#3B71CA" : "#2563EB")("   LOG   ");
const tracePrefix   = chalkText.bgHex(IS_BROWSER ? "#9FA6B2" : "#6B7280")("  TRACE  ");

const success = console.log.bind(console, successPrefix);
const error   = console.error.bind(console, errorPrefix);
const warn    = console.warn.bind(console, warnPrefix);
const info    = console.info.bind(console, infoPrefix);
const debug   = __DEBUG ? console.log.bind(console, debugPrefix) : () => { };
const trace   = __TRACE ? console.debug.bind(console, tracePrefix) : () => { };

const _log = debug as any;
_log.success = success;
_log.error = error;
_log.warn = warn;
_log.info = info;
_log.debug = debug;
_log.trace = trace;

export const log: LogFunction & ILogger = _log;
