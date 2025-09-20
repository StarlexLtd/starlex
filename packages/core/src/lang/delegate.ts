/**
 * Source code comes from private project. I'll add original author when I find.
 */

/**
 * A multicast-enabled function.
 */
type MulticaseDelegate = Function & {
    chain(f: Function): MulticaseDelegate;
    chain(f: Function, thisArg?: any): MulticaseDelegate;
};

/**
 * Options for invoking delegate.
 */
export interface DelegateOptions {
    /**
     * If set to true, the delegate will use last result as next call argument.
     * Only applies when single argument is passed.
     */
    chainResults?: boolean;
}

/**
 * Create a multicast-enabled function.
 * @param f First function to call
 * @param options options for invoking delegate.
 * @returns
 */
export function delegate(f: Function, options?: DelegateOptions): MulticaseDelegate {
    const _callables = [f];

    function chain(f: Function): MulticaseDelegate;
    function chain(f: Function, thisArg?: any): MulticaseDelegate {
        _callables.push(thisArg == null ? f : f.bind(thisArg));
        return caller;
    }

    function caller(...args: any[]) {
        if (options?.chainResults && args.length !== 1) {
            throw new Error("chainResults option can only be used with single argument");
        }

        const chainResults = options?.chainResults && args.length === 1;
        if (chainResults) {
            //@ts-ignore
            return _callables.reduce((prev, curr) => curr.call(this, prev), args[0]);
        } else {
            //@ts-ignore
            return _callables.map(f => f.call(this, ...args));
        }
    }

    caller.chain = chain;
    return caller;
}
