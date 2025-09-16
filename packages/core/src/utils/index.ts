/**
 * Assert
 * @param condition Condition to test.
 * @param message If condition test fails, throw this message as Error.
 */
export function assert(condition: any, message?: string) {
    if (!!!condition) throw new Error(message)
}

export * from "./common";
