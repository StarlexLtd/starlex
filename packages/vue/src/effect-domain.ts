import type { DebuggerOptions, MultiWatchSources, WatchCallback, WatchEffect, WatchEffectOptions, WatchHandle, WatchOptions, WatchSource } from "vue";
import type { ReactiveMarker } from "@vue/reactivity";

import {
    inject, onUnmounted, provide,
    watch as vueWatch,
    watchEffect as vueWatchEffect,
    watchPostEffect as vueWatchPostEffect,
    watchSyncEffect as vueWatchSyncEffect,
} from "vue";

type MaybeUndefined<T, I> = I extends true ? T | undefined : T;
type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V> ? MaybeUndefined<V, Immediate> : T[K] extends object ? MaybeUndefined<T[K], Immediate> : never;
};
type WatchEffectFunc<U> = (effect: WatchEffect, options?: U) => WatchHandle;

// #region Effect Domain

const DomainKey = Symbol("EffectDomain");

export class EffectDomain {
    private readonly _handles = new Set<WatchHandle>();
    private _lock = 0;
    public static readonly Default = new EffectDomain();

    /**
     * Manually increase lock counter.
     * @param count
     */
    public beginUpdate(count: number = 1) {
        this._lock += count;
    }

    public clear() {
        this._handles.clear();
    }

    /**
     * Manually decrease lock counter.
     * @param count
     */
    public endUpdate(count: number = 1) {
        this._lock -= count;
        if (this._lock < 0) this._lock = 0;
    }

    /**
     * Lock watchers and run `fn()`. Lock counter equals to watch handlers.
     * @param fn
     * @returns
     */
    public init<T>(fn: () => MaybePromise<T>): Promise<T> {
        return this.runCore(fn, this._handles.size);
    }

    /**
     * Increase lock counter by 1, and run `fn()`.
     * @param fn
     * @returns
     */
    public run<T>(fn: () => MaybePromise<T>): Promise<T> {
        return this.runCore(fn, this._lock + 1);
    }

    /**
     * 包装了 Vue 的 watch 函数，并根据当前锁的状态决定是否要执行回调。
     *
     * A wrapper to Vue.watch(). Determine whether to execute the callback based on the current lock state.
     *
     * @param source
     * @param cb
     * @param options
     * @returns
     */
    public watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
    public watch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(sources: readonly [...T] | T, cb: [T] extends [ReactiveMarker] ? WatchCallback<T, MaybeUndefined<T, Immediate>> : WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
    public watch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
    public watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
    public watch(source: any, cb: any, options?: WatchOptions): WatchHandle {
        const handle = vueWatch(
            source,
            this.gateEffect(cb),
            options);
        return this.wrapHandle(handle);
    }

    public readonly watchEffect = this.createWatchEffect(vueWatchEffect);
    public readonly watchPostEffect = this.createWatchEffect(vueWatchPostEffect);
    public readonly watchSyncEffect = this.createWatchEffect(vueWatchSyncEffect);

    // #region Private

    private createWatchEffect<U>(runner: WatchEffectFunc<U>): WatchEffectFunc<U> {
        return (effect, options) => {
            const gatedEffect = this.gateEffect(effect);
            const handle = runner(gatedEffect, options);
            return this.wrapHandle(handle);
        };
    }

    private gateEffect<T extends Function>(effect: T): T {
        return (((...args: any[]) => {
            // 侦听器在创建之后，会持续收集变化，即使调用了 `WatchHandle.pause()`。
            // 所以要用锁。锁的数量等于创建了多少侦听器。
            // 每执行一次回调，就把锁-1，直到释放所有的锁。此时，可以真正执行回调了。
            // After creation, the listener will collect changes continuously, even if `WatchHandle.pause()` is invoked.
            // So we use lock counter. Counter value equals to handlers created by this `watch()`.
            // Each time executing watch callback, decrease counter.
            // When counter decreased to 0, callback can actually execute.
            if (this._lock > 0) {
                this._lock--;
                return;
            }

            return effect(...args);
        }) as unknown) as T;
    }

    // Only pause when unlocked.
    private pause() {
        if (this.isLocked) return;
        this._handles.forEach(h => h.pause());
    }

    // Only resume when locked.
    private resume() {
        if (!this.isLocked) return;
        this._handles.forEach(h => h.resume());
    }

    private async runCore<T>(fn: () => MaybePromise<T>, counter: number): Promise<T> {
        this.pause();
        this._lock = counter;
        try {
            // Must await here, make sure `resume()` is called after `fn()`.
            return await fn();
        } finally {
            // Here we shall not decrease lock.
            // Lock must be decreased in watch callback(our wrapper).
            this.resume();
            // After resume, each effects will run once. At this time, lock will be decreased.
        }
    }

    private wrapHandle(handle: WatchHandle): WatchHandle {
        const stop = handle.stop;
        handle.stop = () => {
            this._handles.delete(handle);
            stop();
        };
        this._handles.add(handle);
        return handle;
    }

    // #endregion

    get isLocked(): boolean {
        return this._lock > 0;
    }
}

// #endregion

// #region Utilities

/**
 * Provide a effect domain.
 * @param force Determine whether to create a new domain when there is one. If do need a new domain, set to `true`.
 * @returns `EffectDomain`
 */
export function provideEffectDomain(force = false): EffectDomain {
    // If not force to create, check existing domain.
    if (!force) {
        const existing = inject<EffectDomain | null>(DomainKey, null);
        if (existing) return existing;
    }

    const domain = new EffectDomain();
    provide(DomainKey, domain);

    // Release watch handles.
    onUnmounted(() => {
        domain.clear();
    });

    return domain;
}

/**
 * Create a watcher in current effect domain.
 * @param source
 * @param cb
 * @param options
 */
export function useDomainWatch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export function useDomainWatch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(sources: readonly [...T] | T, cb: [T] extends [ReactiveMarker] ? WatchCallback<T, MaybeUndefined<T, Immediate>> : WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export function useDomainWatch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export function useDomainWatch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export function useDomainWatch(source: any, callback: any, options?: WatchOptions): WatchHandle {
    return useEffectDomain().watch(source, callback, options);
}

/**
 * Get injected effect domain.
 * @returns `EffectDomain`
 */
export function useEffectDomain(): EffectDomain {
    const domain = inject<EffectDomain | null>(DomainKey, null);
    if (domain) return domain;
    throw new Error("EffectDomain: No domain provided. Call `provideEffectDomain()` first.");
}

// #endregion
