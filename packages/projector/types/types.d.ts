/**
 * A Schema defines how to project changes from a source object to a target object.
 */
// prettier-ignore
export type Schema<TSource, T = any> = TSource extends object ?
    Partial<{
        // If the property is an array, map whole array to effect.
        // Else map property to schema.
        [K in keyof T]:
        T[K] extends Array<infer U> ?
        Effect<TSource, U>
        // If TSource is an object, map each property to schema, or write effect for the property.
        : Schema<TSource, T[K]> | Effect<TSource, T[K]>;
    }>
    // Else map T to effect.
    : Effect<TSource, T>;

/**
 * An effect defines how to project a value from source to target.
 */
// todo: Solve this `any`
export type Effect<TSource, TValue> = (target: any, ctx: IEffectContext<TSource, TValue>) => MaybePromise<void>;

/**
 * The context for an effect. It contains information about changes.
 */
export interface IEffectContext<TSource, TValue> {
    /**
     * The source object.
     */
    source?: TSource;
    /**
     * The path of the property.
     */
    path?: string;
    /**
     * The value of the property.
     *
     * If `source` or `path` is not specified, the value is passed from another effect.
     */
    value: TValue;
}

/**
 * Strategy defines actual execution methods for projecting values to target.
 */
export interface ITargetExecutionStrategy<TTarget, TLocation = any> {
    execute<T>(target: TTarget, location: TLocation, value: T): MaybePromise<void>;
    executeArray<T>(target: TTarget, location: TLocation, keys: Partial<keyof T>[], rows: T[]): MaybePromise<void>;
}

export interface IProjector<TSource> {
    project(next: TSource, ...patches: Patch[]): void;
}

export interface IScheduler<TTarget> {
    enqueue(effect: IScheduleItem): void;
    flush(): MaybePromise<void>;
    withTarget(target: TTarget): IScheduler<TTarget>;
    withTarget(target: Func<TTarget>): IScheduler<TTarget>;
}

export interface IScheduleItem<TSource, TValue> {
    path: string;
    effect: Effect<TSource, TValue>;
    ctx: IEffectContext<TSource, TValue>;
}

export interface Patch {
    path: (string | symbol)[];
    value: any;
}
