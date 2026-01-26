import type { Effect, ITargetExecutionStrategy, IEffectContext, ArrayEffectOptions } from "../types";

import { get, keys } from "lodash-es";

const _noopEffect: Effect<any, any> = (ctx) => { };

/**
 * Build effects for a target.
 * @template TSource The type of the source object.
 * @template TLocation The type used to describe a location within an effect target. This is interpreted by the execution strategy and may represent a bookmark, anchor, or address.
 */
export class EffectFactory<TSource extends object, TLocation = any> {
    /**
     * Create an effect bound to a specific location on the target. Source value should be primitive type.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @returns
     */
    public at<T>(location: TLocation): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            return strategy.execute(location, value);
        };
    }

    /**
     * Create an effect bound to a specific location on the target. When it executs, source value will be transformed with `mapper`. Source value should be primitive type.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @param mapper Function to transform the value.
     * @returns
     */
    public atWith<T, R>(location: TLocation, mapper: Func1<T, R>): Effect<TSource, R> {
        const effect = async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const mapped = await mapper(value);
            return strategy.execute(location, mapped);
        };
        // todo: Solve this `unknown`
        return effect as unknown as Effect<TSource, R>;
    }

    /**
     * Create an effect bound to a specific location on the target. Source value should be an array.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @returns
     */
    public arrayAt<T, U = UnwrapArray<T>>(location: TLocation, options?: Partial<ArrayEffectOptions>): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const resolvedOptions = _resolveArrayOptions(rows, options);
                return strategy.executeArray(location, rows, resolvedOptions);
            }
        };
    }

    /**
     * Create an effect bound to a specific location on the target. Source value is converted to array using mapper.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @param mapper Function to transform the element of the array.
     * @param options
     * @returns
     */
    public arrayFrom<T, U extends any[]>(location: TLocation, mapper: Func1<T, U>, options?: Partial<ArrayEffectOptions>): Effect<TSource, U> {
        const effect = async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const rows = await mapper(value);
            const resolvedOptions = _resolveArrayOptions(rows, options);
            return strategy.executeArray(location, rows, resolvedOptions);
        };
        return effect as any;
    }

    /**
     * Create an effect bound to a specific location on the target. When it executs, source value will be transformed with `mapper`. Source value should be an array.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @param mapper Function to transform the element of the array.
     * @returns
     */
    public arrayAtWith<T, U = UnwrapArray<T>, R = any>(location: TLocation, mapper: Func1<U, R>, options?: Partial<ArrayEffectOptions>): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const mapped = rows.map(mapper);
                const resolvedOptions = _resolveArrayOptions(rows, options);
                return strategy.executeArray(location, mapped, resolvedOptions);
            }
        };
    }

    /**
     *
     * @param each
     * @returns
     * @experimental
     */
    public loop<T, U = T extends Array<infer K> ? K : never>(each: Func2<U, number, Effect<TSource, U>>): Effect<TSource, T> {
        return async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            // todo: still thinking how to impl.
            const value = _resolveValue(ctx);
            if (Array.isArray(value)) {
                const values = value as U[];
                for (let i = 0; i < values.length; i++) {
                    const v = values[i];
                    const e = each(v, i);
                    await e(strategy, {
                        // source: ctx.source,
                        // path: ctx.path,
                        value: v,
                    });
                }
            } else {
                throw new Error(`Effect: Value at path '${ctx.path}' is not an array.`);
            }
        };
    }

    /**
     * Create an effect bound to a specific location on the target for `TSource` object. When it executs, `TSource` object will be transformed with `mapper`.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @param mapper Function to transform the `TSource` object.
     * @returns
     */
    public sourceWith<T>(location: TLocation, mapper: Func1<TSource, string>): Effect<TSource, T> {
        return async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const value = await mapper(ctx.source as any);
            return strategy.execute(location, value);
        };
    }

    /**
     * Create an effect bound to a specific location on the target for raw value. This effect will not read from `TSource` object.
     * @param location Identifies the location on the effect target where this effect will be executed.
     * @param rawValue The value to use.
     * @returns
     */
    public raw<T>(location: TLocation, rawValue: T): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            return strategy.execute(location, rawValue);
        };
    }

    /**
     * Execute multiple effects in sequence.
     * @param effects Effects to call.
     * @returns
     */
    public sequence<T>(...effects: Effect<TSource, T>[]): Effect<TSource, T> {
        return async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            for (const f of effects) {
                await f(strategy, {
                    // source: ctx.source,
                    // path: ctx.path,
                    value: value,
                });
            }
        };
    }

    /**
     * Execute multiple effects in sequence. When it executs, `TSource` object will be transformed with `mapper` first, then pass to `effects`.
     * @param mapper Function to transform the value.
     * @param effects Effects to call.
     * @returns
     */
    public sequenceFromSource<R>(mapper: Func1<TSource, R>, ...effects: Effect<TSource, R>[]): Effect<TSource, R> {
        return async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, any>) => {
            const value = await mapper(ctx.source!);
            for (const f of effects) {
                await f(strategy, {
                    value,
                });
            }
        };
    }

    /**
     * Execute multiple effects in sequence. When it executs, source value will be transformed with `mapper` first, then pass to `effects`.
     * @param mapper Function to transform the value.
     * @param effects Effects to call.
     * @returns
     */
    public sequenceWith<T, R>(mapper: Func1<T, R>, ...effects: Effect<TSource, any>[]): Effect<TSource, R> {
        const effect = async (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const raw = _resolveValue(ctx);
            const value = await mapper(raw);
            for (const f of effects) {
                await f(strategy, {
                    // source: ctx.source,
                    // path: ctx.path,
                    value: value,
                });
            }
        };
        // todo: Solve this `unknown`
        return effect as unknown as Effect<TSource, R>;
    }

    /**
     * Execute effect based on condition. The condition is based on the value of the current property path.
     * @param condition Condition delegate that takes the value of the property and returns true or false.
     * @param ifTrue When condition is true, this effect is executed.
     * @param ifFalse When condition is false, this effect is executed.
     * @returns
     */
    public when<T>(condition: Predicate<T>, ifTrue: Effect<TSource, any>, ifFalse: Effect<TSource, any> = _noopEffect): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const cond = condition(value);
            const effect = cond ? ifTrue : ifFalse;
            return effect(strategy, {
                // source: ctx.source,
                // path: ctx.path,
                value: value,
            });
        };
    }

    /**
     * Execute effect based on condition. The condition is based on the `TSource` object.
     * @param condition Condition delegate that takes the `TSource` object and returns true or false.
     * @param ifTrue When condition is true, this effect is executed.
     * @param ifFalse When condition is false, this effect is executed.
     * @returns
     */
    public whenFromSource<T>(condition: Predicate<TSource>, ifTrue: Effect<TSource, any>, ifFalse: Effect<TSource, any> = _noopEffect): Effect<TSource, T> {
        return (strategy: ITargetExecutionStrategy<any, TLocation>, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const cond = condition(ctx.source as any);
            const effect = cond ? ifTrue : ifFalse;
            return effect(strategy, ctx);
        };
    }

}

const _resolveArrayOptions = (rows: any[], options?: Partial<ArrayEffectOptions>) => ({
    keys: typeof rows[0] === "object" ? keys(rows[0]) as any[] : [],
    resolveHeader: (key: string | symbol, index?: number) => String(key),
    ...options,
});

const _resolveValue = <TSource, TValue>(ctx: IEffectContext<TSource, TValue>) =>
    ((!!ctx.source && !!ctx.path) ? get(ctx.source, ctx.path) : ctx.value) as TValue;
