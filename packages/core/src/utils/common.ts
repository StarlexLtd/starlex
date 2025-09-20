import { PatchFlags } from "$/consts";
import { Decorator } from "$/patterns";

/**
 * Assert
 * @param condition Condition to test.
 * @param message If condition test fails, throw this message as Error.
 */
export function assert(condition: any, message?: string) {
    if (!!!condition) throw new Error(message)
}

export function isDecorator<T>(d: any): d is Decorator<T> {
    return d[PatchFlags.IsDecorator] || d instanceof Decorator;
}

export function isHook(o: any): boolean {
    return o[PatchFlags.IsHook];
}

export function isProxy(p: any): boolean {
    return p[PatchFlags.IsProxy];
}
