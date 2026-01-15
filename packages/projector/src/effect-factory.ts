import type { Effect, ITargetExecutionStrategy, IEffectContext } from "../types";

import { get } from "lodash-es";

const _noopEffect: Effect<any, any> = (ctx) => { };

/**
 * Build effects for a target.
 */
export class EffectFactory<TTarget, TSource extends object, TLocation = any> {
    constructor(protected _strategy: ITargetExecutionStrategy<TTarget, TLocation>) {
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
     * Call multiple effects in sequence. Use `mapper` to transform the original value.
     * @param effects Effects to call.
     * @param mapper Function to transform the original value.
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
     * Create an effect that will applied at the specified location.
     * @param location The location in `TTarget` where the effect is executed.
     * @returns
     */
    public create<T>(location: TLocation): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            return this._strategy.execute(target, location, value);
        };
    }

    /**
     * Execute effect based on condition. The condition is based on the value of the current property path.
     * @param condition Condition delegate that takes the original value of the property and returns true or false.
     * @param whenTrue When condition is true, this effect is executed.
     * @param whenFalse When condition is false, this effect is executed.
     * @returns
     */
    public when<T>(condition: Predicate<T>, whenTrue: Effect<TSource, any>, whenFalse: Effect<TSource, any> = _noopEffect): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const cond = condition(value);
            const e = cond ? whenTrue : whenFalse;
            return e(target, {
                // source: ctx.source,
                // path: ctx.path,
                value: value,
            });
        };
    }

    /**
     * Execute effect based on condition. The condition is based on the source object.
     * @param condition Condition delegate that takes the source object and returns true or false.
     * @param whenTrue When condition is true, this effect is executed.
     * @param whenFalse When condition is false, this effect is executed.
     * @returns
     */
    public whenFromSource<T>(condition: Predicate<TSource>, whenTrue: Effect<TSource, any>, whenFalse: Effect<TSource, any> = _noopEffect): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const cond = condition(ctx.source as any);
            const e = cond ? whenTrue : whenFalse;
            return e(target, ctx);
        };
    }

    /**
     * Create an effect that will applied at the specified location. Use `mapper` to transform the source object.
     * @param location The location in `TTarget` where the effect is executed.
     * @param mapper Function to transform the source object.
     * @returns
     */
    public createFromSource<T>(location: TLocation, mapper: Func1<TSource, string>): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const value = mapper(ctx.source as any);
            return this._strategy.execute(target, location, value);
        };
    }

    public forEach<T extends Array<U>, U extends object = any>(location: Func1<number, TLocation>): Effect<TSource, any> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: impl.
        };
    }

    /**
     * Create an effect that will applied at the specified location for array data.
     * @param location The location in `TTarget` where the effect is executed.
     * @returns
     */
    public fromArray<T extends Array<U>, U extends object = any>(location: TLocation): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const keys = Object.keys(rows[0]) as (keyof U)[];
                return this._strategy.executeArray(target, location, keys, rows);
            }
        };
    }

    /**
     * Create an effect that will applied at the specified location for raw value. This effect will not read from source object.
     * @param location The location in `TTarget` where the effect is executed.
     * @param value The value to use.
     * @returns
     */
    public fromValue<T>(location: TLocation, value: T): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            return this._strategy.execute(target, location, value);
        };
    }

    /**
     * Create an effect that will applied at the specified location. Use `mapper` to transform the source object.
     * @param location The location in `TTarget` where the effect is executed.
     * @param mapper Function to transform the source object.
     * @returns
     */
    public createWith<T, R>(location: TLocation, mapper: Func1<T, R>): Effect<TSource, R> {
        const e = (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _resolveValue(ctx);
            const customized = mapper(value);
            return this._strategy.execute(target, location, customized);
        };
        // todo: Solve this `unknown`
        return e as unknown as Effect<TSource, R>;
    }

}

function _resolveValue<TSource, TValue>(ctx: IEffectContext<TSource, TValue>) {
    return ((!!ctx.source && !!ctx.path) ? get(ctx.source, ctx.path) : ctx.value) as TValue;
}
