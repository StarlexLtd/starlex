// #region Environment

const getStatus = (key: "DEBUG" | "TRACE"): boolean =>
    globalThis[key] == true ||
    (typeof window !== "undefined" && (window[key] == true || window.localStorage.getItem(key) == "1" || window.sessionStorage.getItem(key) == "1")) ||
    (typeof process !== "undefined" && process.env[key] == "1");

export const __DEBUG = getStatus("DEBUG");
export const __TRACE = getStatus("TRACE");

export const IS_BROWSER = typeof window !== "undefined" && typeof window.document !== "undefined";

// #endregion

// #region PatchFlags

export const IS_DECORATOR = Symbol("IsDecorator");
export const IS_HOOK = Symbol("IsHook");
export const IS_PROXY = Symbol("IsProxy");

// #endregion
