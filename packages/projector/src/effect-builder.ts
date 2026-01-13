import { get } from "lodash-es";

const _nullEffect: Effect<any, any> = (ctx) => { };

/**
 * Build effects for a target.
 */
export class EffectBuilder<TTarget, TSource extends object> {
    constructor(private _strategy: ITargetStrategy<TTarget>) {
    }

    /**
     * Call multiple effects in sequence.
     * @param effects Effects to call.
     * @returns
     */
    public chain<T>(effects: Effect<TSource, T>[]): Effect<TSource, T> {
        return async (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _getValue(ctx);
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
     * Call multiple effects in sequence. Use `customizer` to transform the original value.
     * @param effects Effects to call.
     * @param customizer Function to transform the original value.
     * @returns
     */
    public chainWith<T, R>(effects: Effect<TSource, R>[], customizer: Func1<T, R>): Effect<TSource, R> {
        const e = async (target: any, ctx: IEffectContext<TSource, T>) => {
            const raw = _getValue(ctx);
            const value = customizer(raw);
            for (const f of effects) {
                await f(target, {
                    // source: ctx.source,
                    // path: ctx.path,
                    value: value,
                });
            }
        };
        // todo: Solve this `unknown`
        return e as unknown as Effect<TSource, R>;
    }

    /**
     * Create an effect for the specified location.
     * @param at The location in `TTarget` where the effect is to be executed.
     * @returns
     */
    public create<T>(at: string): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _getValue(ctx);
            return this._strategy.execute(target, at, value);
        };
    }

    /**
     * Execute effect based on condition. The condition is based on the value of the current property path.
     * @param condition Condition delegate that takes the original value of the property and returns true or false.
     * @param whenTrue When condition is true, this effect is executed.
     * @param whenFalse When condition is false, this effect is executed.
     * @returns
     */
    public createIf<T>(condition: Predicate<T>, whenTrue: Effect<TSource, any>, whenFalse: Effect<TSource, any> = _nullEffect): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _getValue(ctx);
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
    public createIfRoot<T>(condition: Predicate<TSource>, whenTrue: Effect<TSource, any>, whenFalse: Effect<TSource, any> = _nullEffect): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const cond = condition(ctx.source as any);
            const e = cond ? whenTrue : whenFalse;
            return e(target, ctx);
        };
    }

    /**
     * Create an effect for the specified location. Use customizer to transform the source object.
     * @param at The location in `TTarget` where the effect is to be executed.
     * @param customizer Function to transform the source object.
     * @returns
     */
    public createRoot<T>(at: string, customizer: Func1<TSource, string>): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            // todo: Solve this `any`.
            const value = customizer(ctx.source as any);
            return this._strategy.execute(target, at, value);
        };
    }

    /**
     * Create an effect for the specified location for array data.
     * @param at The location in `TTarget` where the effect is to be executed.
     * @returns
     */
    public createForArray<T extends Array<U>, U extends object = any>(at: string): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            const rows = ctx.path ? get(ctx.source, ctx.path) as U[] : ctx.value as U[];
            // Only calls when `rows` is definitely an array and has data.
            if (rows && Array.isArray(rows) && rows.length > 0) {
                const keys = Object.keys(rows[0]) as (keyof U)[];
                return this._strategy.executeArray(target, at, keys, rows);
            }
        };
    }

    /**
     * Create an effect for the specified location for raw value. This will not read from source object.
     * @param at The location in `TTarget` where the effect is to be executed.
     * @param raw Raw value to use.
     * @returns
     */
    public createForRaw<T>(at: string, raw: T): Effect<TSource, T> {
        return (target: any, ctx: IEffectContext<TSource, T>) => {
            return this._strategy.execute(target, at, raw);
        };
    }

    /**
     * Create an effect for the specified location. Use `customizer` to transform the source object.
     * @param at The location in `TTarget` where the effect is to be executed.
     * @param customizer Function to transform the source object.
     * @returns
     */
    public createWith<T, R>(at: string, customizer: Func1<T, R>):  Effect<TSource, R> {
        const e = (target: any, ctx: IEffectContext<TSource, T>) => {
            const value = _getValue(ctx);
            const customized = customizer(value);
            return this._strategy.execute(target, at, customized);
        };
        // todo: Solve this `unknown`
        return e as unknown as Effect<TSource, R>;
    }

}

function _getValue<TSource, TValue>(ctx: IEffectContext<TSource, TValue>) {
    return ((!!ctx.source && !!ctx.path) ? get(ctx.source, ctx.path) : ctx.value) as TValue;
}
