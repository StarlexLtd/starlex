// #region Environment

export const IS_BROWSER = typeof window !== "undefined" && typeof window.document !== "undefined";

// #endregion

// #region PatchFlags

export const IS_DECORATOR = Symbol("IsDecorator");
export const IS_HOOK = Symbol("IsHook");
export const IS_PROXY = Symbol("IsProxy");

// #endregion
