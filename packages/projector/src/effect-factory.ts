import type { Effect, ITargetExecutionStrategy, IEffectContext, ArrayEffectOptions } from "../types";

import { get, keys } from "lodash-es";

const _noopEffect: Effect<any, any> = (ctx) => { };

/**
 * Build effects for a target.
 */
export class EffectFactory<TTarget, TSource extends object, TLocation = any> {
    constructor(protected _strategy: ITargetExecutionStrategy<TTarget, TLocation>) {
    }

    /**
     * Create an effect that will be applied at the specified location.
     * @param location The location in `TTarget` where the effect is executed.
     * @returns
     */
    public at<T>(location: TLocation): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            return this._strategy.execute(target, location, value);
        };
    }

    /**
     * Create an effect that will be applied at the specified location. Use `mapper` to transform the value.
     * @param location The location in `TTarget` where the effect is executed.
     * @param mapper Function to transform the value.
     * @returns
     */
    public atWith<T, R>(location: TLocation, mapper: Func1<T, R>): Effect<TSource, R> {
        const effect = (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const mapped = mapper(value);
            return this._strategy.execute(target, location, mapped);
        };
        // todo: Solve this `unknown`
        return effect as unknown as Effect<TSource, R>;
    }

    /**
     * Create an effect that will be applied at the specified location for array data.
     * @param location The location in `TTarget` where the effect is executed.
     * @returns
     */
    public arrayAt<T, U = UnwrapArray<T>>(location: TLocation, options?: Partial<ArrayEffectOptions>): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const resolvedOptions = {
                    keys: typeof rows[0] === "object" ? keys(rows[0]) as any[] : [],
                    resolveHeader: (key: string | symbol, index?: number) => String(key),
                    ...options,
                };

                return this._strategy.executeArray(target, location, rows, resolvedOptions);
            }
        };
    }

    /**
     * Create an effect that will be applied at the specified location for array data.
     * @param location The location in `TTarget` where the effect is executed.
     * @param mapper Function to transform the element of the array.
     * @returns
     */
    public arrayAtWith<T, U = UnwrapArray<T>, R = any>(location: TLocation, mapper: Func1<U, R>, options?: Partial<ArrayEffectOptions>): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const mapped = rows.map(mapper);
                const resolvedOptions = {
                    keys: typeof rows[0] === "object" ? keys(rows[0]) as any[] : [],
                    resolveHeader: (key: string | symbol, index?: number) => String(key),
                    ...options,
                };

                return this._strategy.executeArray(target, location, mapped, resolvedOptions);
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
        return async (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: still thinking how to impl.
            const value = _resolveValue(ctx);
            if (Array.isArray(value)) {
                const values = value as U[];
                for (let i = 0; i < values.length; i++) {
                    const v = values[i];
                    const e = each(v, i);
                    const r = e(target, {
                        // source: ctx.source,
                        // path: ctx.path,
                        value: v,
                    });
                    if (r instanceof Promise) {
                        await r;
                    }
                }
            } else {
                throw new Error(`Effect: Value at path '${ctx.path}' is not an array.`);
            }
        };
    }

    /**
     * Create an effect that will be applied at the specified location for `TSource` object. Use `mapper` to transform the `TSource` object.
     * @param location The location in `TTarget` where the effect is executed.
     * @param mapper Function to transform the `TSource` object.
     * @returns
     */
    public sourceWith<T>(location: TLocation, mapper: Func1<TSource, string>): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const value = mapper(ctx.source as any);
            return this._strategy.execute(target, location, value);
        };
    }

    /**
     * Create an effect that will be applied at the specified location for raw value. This effect will not read from `TSource` object.
     * @param location The location in `TTarget` where the effect is executed.
     * @param rawValue The value to use.
     * @returns
     */
    public raw<T>(location: TLocation, rawValue: T): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            return this._strategy.execute(target, location, rawValue);
        };
    }

    /**
     * Call multiple effects in sequence.
     * @param effects Effects to call.
     * @returns
     */
    public sequence<T>(effects: Effect<TSource, T>[]): Effect<TSource, T> {
        return async (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            for (const f of effects) {
                await f(target, {
                    // source: ctx.source,
                    // path: ctx.path,
                    value: value,
                });
            }
        };
    }

    /**
     * Call multiple effects in sequence. Use `mapper` to transform the value.
     * @param effects Effects to call.
     * @param mapper Function to transform the value.
     * @returns
     */
    public sequenceWith<T, R>(effects: Effect<TSource, R>[], mapper: Func1<T, R>): Effect<TSource, R> {
        const effect = async (target: any, ctx: IEffectContext<TSource, T>) => {
            const raw = _resolveValue(ctx);
            const value = mapper(raw);
            for (const f of effects) {
                await f(target, {
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
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const cond = condition(value);
            const effect = cond ? ifTrue : ifFalse;
            return effect(target, {
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
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const cond = condition(ctx.source as any);
            const effect = cond ? ifTrue : ifFalse;
            return effect(target, ctx);
        };
    }

}

const _resolveValue = <TSource, TValue>(ctx: IEffectContext<TSource, TValue>) =>
    ((!!ctx.source && !!ctx.path) ? get(ctx.source, ctx.path) : ctx.value) as TValue;
