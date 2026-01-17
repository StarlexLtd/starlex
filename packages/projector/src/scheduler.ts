import type { IScheduleItem, IScheduler, ITargetExecutionStrategy } from "../types";

/**
 * Scheduler abstract class, used to schedule projector effects.
 */
export abstract class Scheduler<TTarget> implements IScheduler<TTarget> {
    protected readonly _queue = new Map<string, IScheduleItem<any, any>>();
    protected _strategyFactory?: Func<ITargetExecutionStrategy<TTarget, any>>;

    constructor(protected _strategy?: ITargetExecutionStrategy<TTarget, any>) {
    }

    public abstract enqueue(item: IScheduleItem<any, any>): IScheduler<TTarget>;
    public abstract flush(): MaybePromise<void>;

    public withStrategy(strategy: ITargetExecutionStrategy<TTarget, any>): IScheduler<TTarget>;
    public withStrategy(strategy: Func<ITargetExecutionStrategy<TTarget, any>>): IScheduler<TTarget>;
    public withStrategy(strategy: ITargetExecutionStrategy<TTarget, any> | Func<ITargetExecutionStrategy<TTarget, any>>): IScheduler<TTarget> {
        if (typeof strategy === "function") {
            this._strategyFactory = strategy as any;
        } else {
            this._strategy = strategy;
        }
        return this;
    }

    protected checkStrategy() {
        (!this._strategy && this._strategyFactory)
            && (this._strategy = this._strategyFactory());

        if (!this._strategy) {
            throw new Error("Scheduler: target is not set");
        }
    }
}

/**
 * Buffered scheduler, will buffer effects and execute them in batch.
 */
export class BufferedScheduler<TTarget> extends Scheduler<TTarget> {
    public override enqueue(item: IScheduleItem<any, any>): IScheduler<TTarget> {
        // Same path will be overwritten, keep the latest.
        this._queue.set(item.path, item);
        return this;
    }

    public override async flush(): Promise<void> {
        this.checkStrategy();
        log.trace("BufferedScheduler: flushing", [...this._queue.keys()]);

        // make a shallow copy
        const q = [...this._queue.values()];
        // ready for next enqueue
        this._queue.clear();

        for (const item of q) {
            const { effect, ctx } = item;
            const result = effect(this._strategy!, ctx);
            if (result instanceof Promise) {
                await result;
            }
        }
    }

}
