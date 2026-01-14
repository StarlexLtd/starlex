// prettier-ignore
type Schema<TSource, T = any> = TSource extends object ?
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

// todo: Solve this `any`
type Effect<TSource, TValue> = (target: any, ctx: IEffectContext<TSource, TValue>) => MaybePromise<void>;

interface IEffectContext<TSource, TValue> {
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

interface ITargetStrategy<TTarget> {
    execute<T>(target: TTarget, at: string, value: T): MaybePromise<void>;
    executeArray<T>(target: TTarget, at: string, keys: Partial<keyof T>[], rows: T[]): MaybePromise<void>;
}

interface IProjector<TSource> {
    project(next: TSource, ...patches: Patch[]): void;
}

interface IScheduler<TTarget> {
    enqueue(effect: IScheduleItem): void;
    flush(): MaybePromise<void>;
    withTarget(target: TTarget): IScheduler<TTarget>;
    withTarget(target: Func<TTarget>): IScheduler<TTarget>;
}

interface IScheduleItem<TSource, TValue> {
    path: string;
    effect: Effect<TSource, TValue>;
    ctx: IEffectContext<TSource, TValue>;
}

interface Patch {
    path: (string | symbol)[];
    value: any;
}
