/**
 * Common utils.
 *
 * !! Attention !!
 * !! As few dependencies as possible !!
 *
 */

import { IS_DECORATOR, IS_HOOK, IS_PROXY } from "$/consts";

/**
 * Assert
 * @param condition Condition to test.
 * @param message If condition test fails, throw this message as Error.
 */
export function assert(condition: any, message?: string) {
    if (!!!condition) throw new Error(message);
}

export function installToGlobalObject(content: Record<string, any>) {
    const globalObj =
        typeof window !== "undefined" ? window :
        typeof globalThis !== "undefined" ? globalThis :
        undefined as any;

    if (!globalObj) {
        return;
    }

    for (const key in content) {
        if (globalObj[key] != null) {
            log.warn(`core.common.installToGlobalObject: "${key}" has been installed, will be overridden.`);
        }
        globalObj[key] = content[key];
    }
}

export function isDecorator(d: any): boolean {
    return d[IS_DECORATOR];
}

export function isHook(o: any): boolean {
    return o[IS_HOOK];
}

export function isProxy(p: any): boolean {
    return p[IS_PROXY];
}
