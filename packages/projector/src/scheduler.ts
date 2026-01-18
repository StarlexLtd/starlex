import type { IScheduleItem, IScheduler, ITargetExecutionStrategy } from "../types";

import { debounce } from "lodash-es";

/**
 * Scheduler abstract class, used to schedule projector effects.
 */
export abstract class Scheduler<TTarget> implements IScheduler<TTarget> {
    protected readonly _queue = new Map<string, IScheduleItem<any, any>>();
    protected _strategyFactory?: Func<ITargetExecutionStrategy<TTarget, any>>;

    constructor(protected _strategy?: ITargetExecutionStrategy<TTarget, any>) {
    }

    public enqueue(item: IScheduleItem<any, any>): IScheduler<TTarget> {
        // Same path will be overwritten, keep the latest.
        this._queue.set(item.path, item);
        return this;
    }

    public flush(): MaybePromise<void> {
        this.checkStrategy();
        log.trace("Scheduler.flush()", [...this._queue.keys()]);
        return this.flushCore();
    }

    public withStrategy(strategy: ITargetExecutionStrategy<TTarget, any>): IScheduler<TTarget>;
    public withStrategy(factory: Func<ITargetExecutionStrategy<TTarget, any>>): IScheduler<TTarget>;
    public withStrategy(arg: ITargetExecutionStrategy<TTarget, any> | Func<ITargetExecutionStrategy<TTarget, any>>): IScheduler<TTarget> {
        if (typeof arg === "function") {
            this._strategyFactory = arg as any;
        } else {
            this._strategy = arg;
        }
        return this;
    }

    protected checkStrategy() {
        (!this._strategy && this._strategyFactory)
            && (this._strategy = this._strategyFactory());

        if (!this._strategy) {
            throw new Error("Scheduler: no strategy.");
        }
    }

    protected abstract flushCore(): MaybePromise<void>;

    protected async run(list: IScheduleItem<any, any>[]): Promise<void> {
        for (const item of list) {
            const { effect, ctx } = item;
            const result = effect(this._strategy!, ctx);
            if (result instanceof Promise) {
                await result;
            }
        }
    }
}

/**
 * A scheduler that **delays and batches** effect executions using debounce.
 *
 * Effects are collected in a queue and only executed after the specified `wait`
 * has passed without any new effects being enqueued. This helps reduce redundant
 * executions (e.g. during rapid successive state updates) and is especially useful
 * when projecting to expensive targets like UI rendering, DOM updates, or network requests.
 *
 * In contrast to `TotalScheduler` which eagerly executes all effects on every projection,
 * `LazyScheduler` is more conservative: it waits for a quiet period before flushing the accumulated
 * effects in batch.
 */
export class LazyScheduler<TTarget> extends Scheduler<TTarget> {
    constructor(strategy?: ITargetExecutionStrategy<TTarget, any>, protected wait: number = 500) {
        super(strategy);
    }

    protected readonly flushCore = debounce(async () => {
        // make a shallow copy
        const q = [...this._queue.values()];
        // ready for next enqueue
        this._queue.clear();

        this.run(q);
    }, this.wait);
}

/**
 * Run all queued effects at once. The queue will NOT be cleared. The strategy will `reset()` before running any effects.
 */
export class TotalScheduler<TTarget> extends Scheduler<TTarget> {
    protected override async flushCore(): Promise<void> {
        this._strategy!.reset();
        this.run([...this._queue.values()]);
    }
}
