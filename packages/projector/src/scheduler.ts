/**
 * Scheduler abstract class, used to schedule projector effects.
 */
export abstract class Scheduler<TTarget> implements IScheduler<TTarget> {
    protected _targetFactory: Func<TTarget> | null = null;

    constructor(protected _target: TTarget | null = null) {
    }

    public abstract enqueue(item: SchedulerItem<TTarget, any>): IScheduler<TTarget>;
    public abstract flush(): MaybePromise<void>;

    public withTarget(target: TTarget): IScheduler<TTarget>;
    public withTarget(target: Func<TTarget>): IScheduler<TTarget>;
    public withTarget(target: TTarget | Func<TTarget>): IScheduler<TTarget> {
        if (typeof target === "function") {
            this._targetFactory = target as any;
        } else {
            this._target = target;
        }
        return this;
    }

    protected checkTarget() {
        (!this._target && this._targetFactory)
            && (this._target = this._targetFactory());

        if (!this._target) {
            throw new Error("Scheduler: target is not set");
        }
    }
}

/**
 * Buffered scheduler, will buffer effects and execute them in batch.
 */
export class BufferedScheduler<TTarget> extends Scheduler<TTarget> {
    protected readonly _queue = new Map<string, SchedulerItem<TTarget, any>>();

    public override enqueue(item: SchedulerItem<TTarget, any>): IScheduler<TTarget> {
        // Same path will be overwritten, keep the latest.
        this._queue.set(item.path, item);
        return this;
    }

    public override async flush(): Promise<void> {
        this.checkTarget();

        // make a shallow copy
        const q = [...this._queue.values()];
        // ready for next enqueue
        this._queue.clear();

        for (const item of q) {
            const { effect, ctx } = item;
            const result = effect(this._target, ctx);
            if (result instanceof Promise) {
                await result;
            }
        }
    }

}
