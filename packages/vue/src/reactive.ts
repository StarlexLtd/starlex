import type { ShallowRef } from "vue";

import { reactive, shallowRef, watch } from "vue";

export interface IDeepPropertyChangeEvent {
    path: string;
    value: any;
    oldValue: any;
};

export interface IDeepChangeTracker<T extends object> {
    proxy: T;
    change: ShallowRef<IDeepPropertyChangeEvent | undefined>;
}

export interface IDeepWatcher<T extends object> {
    proxy: T;
    stop: () => void;
}

export interface IBufferedDeepWatcher<T extends object> extends IDeepWatcher<T> {
    flush: () => MaybePromise<void>;
}

interface IWatchOptions {
    /**
     * Flush timeout.
     */
    interval?: number;

    /**
     * Flush handler.
     * @param changes All changes from last flush. Key of the map is property path. Same path will keep the latest change.
     * @returns
     */
    onFlush: (changes: Map<string, IDeepPropertyChangeEvent>) => MaybePromise<void>;
}

/**
 * Track deep changes of the object, notify changed property path.
 *
 * Changes are notified synchronously.
 * @param obj The tracking object.
 * @returns
 * @example
 * ```js
 * const { proxy: trackedObject, change } = trackDeepChange(rawObject);
 * const reactiveObject = reactive(trackedObject);
 * watch(change, (e) => {
 *   // process changes.
 * });
 * ```
 */
export function trackDeepChange<T extends object>(obj: T): IDeepChangeTracker<T> {
    const change = shallowRef<IDeepPropertyChangeEvent | undefined>();
    const cache = new WeakMap<object, any>();

    const createProxy = (target: any, basePath: string): any => {
        if (typeof target !== "object" || target == null) {
            return target;
        }

        if (cache.has(target)) {
            return cache.get(target);
        }

        const p = new Proxy(target, {
            get(t, k, r) {
                const value = Reflect.get(t, k, r);
                if (typeof value === 'object' && value != null) {
                    const nextPath = Array.isArray(t)
                        ? `${basePath}[${String(k)}]`
                        : basePath ? `${basePath}.${String(k)}` : String(k);
                    return createProxy(value, nextPath);
                }
                return value;
            },
            set(t, k, v, r) {
                const fullPath = Array.isArray(t)
                    ? `${basePath}[${String(k)}]`
                    : (basePath ? `${basePath}.${String(k)}` : String(k));
                const oldValue = t[k];
                const ok = Reflect.set(t, k, v, r);

                change.value = {
                    path: fullPath,
                    value: v,
                    oldValue,
                };

                return ok;
            },
        });

        cache.set(target, p);
        return p;
    };

    const proxy = createProxy(obj, "");
    return { proxy: proxy as T, change };
}

export function useDeepWatch<T extends object>(obj: T, changeHandler: Action1<IDeepPropertyChangeEvent>): IDeepWatcher<T> {
    const { proxy, change } = trackDeepChange(obj);
    const reactiveObj = reactive(proxy);
    const stop = watch(change, (e) => {
        (!!e) && changeHandler(e);
    });
    return {
        proxy: reactiveObj as T,
        stop,
    };
}

export function useBufferedDeepWatch<T extends object>(obj: T, options: IWatchOptions): IBufferedDeepWatcher<T> {
    const { proxy, change } = trackDeepChange(obj);
    const { interval = 500 } = options;

    // Buffer for changes. Use change path as key.
    let buffer = new Map<string, IDeepPropertyChangeEvent>();

    let timer: number | undefined = undefined;
    const startTimer = () => {
        if (timer) return;
        timer = window.setInterval(flush, interval);
    };

    const stopWatch = watch(change, (e) => {
        if (!e) return;
        buffer.set(e.path, e);
        startTimer();
    });

    const stop = () => {
        stopWatch();
        if (timer) {
            window.clearInterval(timer);
            timer = undefined;
        }
    };

    const flush = async () => {
        if (buffer.size == 0) return;
        const oldBuffer = buffer;
        buffer = new Map();
        try {
            await options.onFlush(oldBuffer);
        } catch (err) {
            log.error("flush changes failed", err);
        }
    };

    return {
        proxy,
        stop,
        flush,
    };
}
