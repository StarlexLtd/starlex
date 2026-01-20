import type { IRecorder, IScheduler, ITargetExecutionStrategy, Schema } from "../types";

import onChange from "on-change";
import { DynamicProjector, Projector } from "./projector";
import { LazyRecorder, Recorder } from "./recorder";
import { LazyScheduler, TotalScheduler } from "./scheduler";
import { debounce } from "lodash-es";
import { track } from "./utils";

export class Builder<TSource extends object, TTarget, TLocation> {
    private _flushCallback?: Action;
    private _recorder?: IRecorder<TSource>;
    private _scheduler?: IScheduler<TTarget>;
    private _strategyFactory?: Func<ITargetExecutionStrategy<TTarget, TLocation>>;
    private _tracked?: TSource;

    constructor(private _initial: TSource, private _schema: Schema<TSource>, private _waitTime: number = 500) {
        if (!_initial || !_schema || !_waitTime) {
            throw new Error("Builder: all params are required.");
        }

        if (Number(_waitTime) < 0) {
            throw new Error("Builder: wait time must be >= 0.");
        }
    }

    public buildDynamic() {
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
        if (!this._strategyFactory) {
            throw new Error("Builder: no strategy was provided. Call `withStrategy()` to provide.");
        }

        if (!this._scheduler) {
            this._scheduler = new LazyScheduler();
        }

        if (!this._flushCallback) {
            log.warn("Builder: no flush callback was provided.");
        }

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
