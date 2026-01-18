import type { IScheduler, ITargetExecutionStrategy, Schema } from "../types";

import onChange from "on-change";
import { DynamicProjector, Projector } from "./projector";
import { Recorder } from "./recorder";
import { LazyScheduler, TotalScheduler } from "./scheduler";
import { debounce } from "lodash-es";

export class Builder<TSource extends object, TTarget, TLocation> {
    private _flushWait: number = 0;
    private _onFlush?: Action;
    private _recorder?: Recorder<TSource>;
    private _scheduler?: IScheduler<TTarget>;
    private _strategy?: ITargetExecutionStrategy<TTarget, TLocation>;
    private _strategyFactory?: Func<ITargetExecutionStrategy<TTarget, TLocation>>;
    private _tracked?: TSource;

    constructor(private _initial: TSource, private _schema: Schema<TSource>) {
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

    public buildStatic() {
        if (!this._scheduler) {
            throw new Error("Builder: no scheduler was provided. Call `withLazyScheduler()` or `withTotalScheduler()` to provide.");
        }

        if (!this._strategy && !this._strategyFactory) {
            throw new Error("Builder: no strategy was provided. Call `withStrategy()` to provide.");
        }

        if (!this._onFlush) {
            throw new Error("Builder: no flush handler was provided. Call `onFlush()` to provide.");
        }

        const flush = async () => {
            await this._scheduler!.flush();
            this._onFlush!();
        }

        this.track();
        this._scheduler.withStrategy((this._strategy ?? this._strategyFactory) as any);
        const projector = new Projector(this._schema, this._scheduler);
        this._recorder!.sendTo(projector);
        this._recorder!.on("record", this._flushWait ? debounce(flush, this._flushWait) : flush);

        return {
            tracked: this._tracked!,
            recorder: this._recorder!,
            scheduler: this._scheduler!,
        };
    }

    public onFlush(callback: Action, wait: number = 500): Builder<TSource, TTarget, TLocation> {
        this._onFlush = callback;
        this._flushWait = wait;
        return this;
    }

    public withLazyScheduler(wait: number = 500): Builder<TSource, TTarget, TLocation> {
        this._scheduler = new LazyScheduler(undefined, wait);
        return this;
    }

    public withTotalScheduler(): Builder<TSource, TTarget, TLocation> {
        this._scheduler = new TotalScheduler();
        return this;
    }

    public withStrategy(strategy: ITargetExecutionStrategy<TTarget, TLocation>): Builder<TSource, TTarget, TLocation>;
    public withStrategy(factory: Func<ITargetExecutionStrategy<TTarget, TLocation>>): Builder<TSource, TTarget, TLocation>;
    public withStrategy(arg: ITargetExecutionStrategy<TTarget, TLocation> | Func<ITargetExecutionStrategy<TTarget, TLocation>>): Builder<TSource, TTarget, TLocation> {
        if (typeof arg === "function") {
            this._strategyFactory = arg as any;
        } else {
            this._strategy = arg;
        }

        return this;
    }

    private track() {
        // Build only once.
        if (this._recorder && this._tracked) return;

        this._recorder = new Recorder(this._initial);
        this._tracked = onChange(
            this._initial,
            (path, value) => this._recorder!.receive(path, value),
            {
                pathAsArray: true,
            });
    }

}
