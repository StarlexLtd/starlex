import type { IRecorder, IScheduler, ITargetExecutionStrategy, Schema } from "../types";

import { DynamicProjector, Projector } from "./projector";
import { LazyScheduler, Scheduler, TotalScheduler } from "./scheduler";
import { debounce } from "lodash-es";
import { track } from "./utils";

/**
 * Builder pattern for projector.
 * @template TSource Source object structure.
 * @template TTarget Projection target.
 * @template TLocation A descriptor of location in `TTarget` where projection effects are executed.
 */
export class Builder<TSource extends object, TTarget, TLocation> {
    private _flushCallback?: Action;
    private _recorder?: IRecorder<TSource>;
    private _schema?: Schema<TSource>;
    private _scheduler?: IScheduler<TTarget>;
    private _strategyFactory?: Func<ITargetExecutionStrategy<TTarget, TLocation>>;
    private _tracked?: TSource;
    private _waitTime: number = 500;

    constructor(private _initial: TSource) {
        if (!_initial) {
            throw new Error("Builder: initial object is required.");
        }
    }

    public buildDynamic() {
        if (!this._schema) {
            throw new Error("Builder: no schema. Call `loadSchema()` before build.");
        }

        this.track();
        const projector = new DynamicProjector(this._schema);
        if (this._scheduler) {
            projector.withScheduler(this._scheduler);
        }
        this._recorder!.sendTo(projector);

        return {
            tracked: this._tracked!,
            recorder: this._recorder!,
            projector,
            scheduler: this._scheduler,
        };
    }

    public build() {
        if (!this._schema) {
            throw new Error("Builder: no schema. Call `loadSchema()` before build.");
        }

        if (!this._strategyFactory) {
            throw new Error("Builder: no strategy. Call `withStrategy()` before build.");
        }

        if (!this._scheduler) {
            this._scheduler = new LazyScheduler();
        }

        /*
        if (!this._flushCallback) {
            log.warn("Builder: no flush callback was provided.");
        }
        */

        const flush = async () => {
            await this._scheduler!.flush();
            this._flushCallback?.();
        }

        this.track();
        this._scheduler.withStrategy(this._strategyFactory);
        const projector = new Projector(this._schema, this._scheduler);
        this._recorder!.sendTo(projector);
        this._recorder!.on("record", this._waitTime ? debounce(flush, this._waitTime) : flush);

        return {
            tracked: this._tracked!,
            recorder: this._recorder!,
            scheduler: this._scheduler!,
        };
    }

    /**
     * Use debounced Recorder/Scheduler.
     * @param wait Debounce time in milliseconds. Default: 500.
     * @returns
     */
    public lazy(wait: number = 500): Builder<TSource, TTarget, TLocation> {
        if (Number(wait) < 0) {
            throw new Error("Builder: wait time must be >= 0.");
        }

        this._waitTime = wait;
        return this;
    }

    public loadSchema(schema: Schema<TSource>): Builder<TSource, TTarget, TLocation> {
        this._schema = schema;
        return this;
    }

    /**
     * Provide a callback to execute after scheduler flushed.
     * @param callback
     * @returns
     */
    public onFlush(callback: Action): Builder<TSource, TTarget, TLocation> {
        this._flushCallback = callback;
        return this;
    }

    public withLazyScheduler(): Builder<TSource, TTarget, TLocation> {
        this._scheduler = new LazyScheduler(undefined, this._waitTime);
        return this;
    }

    public withScheduler(): Builder<TSource, TTarget, TLocation> {
        this._scheduler = new Scheduler(undefined);
        return this;
    }

    public withTotalScheduler(): Builder<TSource, TTarget, TLocation> {
        this._scheduler = new TotalScheduler();
        return this;
    }

    public withStrategy(strategy: ITargetExecutionStrategy<TTarget, TLocation>): Builder<TSource, TTarget, TLocation>;
    public withStrategy(factory: Func<ITargetExecutionStrategy<TTarget, TLocation>>): Builder<TSource, TTarget, TLocation>;
    public withStrategy(arg: ITargetExecutionStrategy<TTarget, TLocation> | Func<ITargetExecutionStrategy<TTarget, TLocation>>): Builder<TSource, TTarget, TLocation> {
        this._strategyFactory = typeof arg === "function" ? arg : () => arg;
        return this;
    }

    private track() {
        // Build only once.
        if (this._recorder && this._tracked) return;
        [this._tracked, this._recorder] = track(this._initial, this._waitTime);
    }

}
