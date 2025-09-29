/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import { IS_BROWSER } from "../consts";

const getStatus = (key: "DEBUG" | "TRACE"): boolean =>
    globalThis[key] == true ||
    (typeof window !== "undefined" && window[key] == true) ||
    (typeof process !== "undefined" && process.env[key] == "1");

const __DEBUG = getStatus("DEBUG");
const __TRACE = getStatus("TRACE");

const chalkText = IS_BROWSER ? chalk.whiteBright : chalk.black;

const success = console.log.bind(console, chalkText.bgGreenBright(" SUCCESS "));
const error = console.error.bind(console, chalkText.bgRedBright(IS_BROWSER ? " ERROR " : "  ERROR  "));
const warn = console.warn.bind(console, chalkText.bgYellow(" WARNING "));
const info = console.info.bind(console, chalkText.bgCyan(IS_BROWSER ? " INFO " : "  INFO   "));
const debug = __DEBUG ? console.log.bind(console, chalkText.bgBlueBright(IS_BROWSER ? " LOG " : "   LOG   ")) : () => { };
const trace = __TRACE ? console.debug.bind(console, chalkText.bgGray(IS_BROWSER ? " TRACE " : "  TRACE  ")) : () => { };

const _log = debug as any;
_log.success = success;
_log.error = error;
_log.warn = warn;
_log.info = info;
_log.debug = debug;
_log.trace = trace;

export const log: LogFunction & ILogger = _log;
