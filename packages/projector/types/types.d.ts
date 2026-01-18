/**
 * A Schema defines how to project changes from a source object to a target object.
 */
// prettier-ignore
export type Schema<TSource, T = TSource> = {
    // If the property is an array, map to effect.
    [K in keyof T]?: T[K] extends Array<infer U>
        ? Effect<TSource, U[]>
        // Else, if the property is an object, map to schema or effect.
        : T[K] extends object
            ? Schema<TSource, T[K]> | Effect<TSource, T[K]>
            // Else, leaf property, map to effect.
            : Effect<TSource, T[K]>;
};

/**
 * An effect defines how to project a value from source to target.
 */
// todo: Solve ITargetExecutionStrategy<any, any>. How to obtain TTarget and TLocation?
export type Effect<TSource, TValue> = (strategy: ITargetExecutionStrategy<any, any>, ctx: IEffectContext<TSource, TValue>) => MaybePromise<void>;

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
 * Options for execute array effect.
 */
export type ArrayEffectOptions = {
    /**
     * The keys of the objects in the array. Use this only when element of array is object.
     */
    keys: (string | symbol)[];

    /**
     * Function to generate header for each column.
     */
    resolveHeader: (key: string | symbol, index?: number) => string;
}

/**
 * Strategy defines actual execution methods for projecting values to target.
 */
export interface ITargetExecutionStrategy<TTarget, TLocation> {
    execute<T extends any>(location: TLocation, value: T): MaybePromise<void>;
    executeArray<T extends any>(location: TLocation, rows: T[], options: ArrayEffectOptions): MaybePromise<void>;
    reset(): void;
}

export interface IProjector<TSource> {
    project(next: TSource, ...patches: Patch[]): void;
}

export interface IScheduler<TTarget> {
    enqueue(effect: IScheduleItem): void;
    flush(): MaybePromise<void>;
    withStrategy(strategy: ITargetExecutionStrategy<TTarget, any>): IScheduler<TTarget>;
    withStrategy(factory: Func<ITargetExecutionStrategy<TTarget, any>>): IScheduler<TTarget>;
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
