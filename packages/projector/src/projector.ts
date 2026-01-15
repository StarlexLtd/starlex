import type { Effect, IProjector, IScheduler, Patch, Schema } from "../types";

export abstract class ProjectorBase<TSource> implements IProjector<TSource> {
    protected _scheduler?: IScheduler<any>;

    constructor(protected _schema: Schema<TSource>) {
        if (!_schema) {
            throw new Error("Projector: Schema is required.");
        }
    }

    public project(next: TSource, ...patches: Patch[]) {
        for (const patch of patches) {
            this._dispatch(next, patch);
        }
    }

    protected _dispatch(next: TSource, patch: Patch) {
        const { path, value } = patch;
        const effect = this._resolveEffect(path);
        if (!effect) return;

        this._ensureScheduler();
        this._scheduler!.enqueue({
            path: path.join("."),
            effect,
            ctx: {
                source: next,
                path,
                value,
            }
        });

    }

    protected _ensureScheduler() {
        if (!this._scheduler)
            throw new Error("Projector: no scheduler.");
    }

    protected _resolveEffect(path: (string | symbol)[]): Effect<TSource, any> | null {
        let node = this._schema;
        for (const key of path) {
            if (!node) return null;
            // Force to read. If structure is not matched, return null and next loop will handle it.
            node = (node as any)[key];
        }

        return typeof node === "function" ? node : null;
    }
}

export class Projector<TSource> extends ProjectorBase<TSource> {
    constructor(_schema: Schema<TSource>, _scheduler: IScheduler<any>) {
        super(_schema);
        this._scheduler = _scheduler;
    }
}

export class DynamicProjector<TSource> extends ProjectorBase<TSource> {
    private _schedulerFactory?: Func<IScheduler<any>>;

    public scheduleWith(scheduler: IScheduler<any>): IProjector<TSource>;
    public scheduleWith(schedulerFactory: Func<IScheduler<any>>): IProjector<TSource>;
    public scheduleWith(arg: IScheduler<any> | Func<IScheduler<any>>): IProjector<TSource> {
        if (typeof arg === "function") {
            this._schedulerFactory = arg;
        } else {
            this._scheduler = arg;
        }

        return this;
    }

    protected override _ensureScheduler() {
        if (!this._scheduler && this._schedulerFactory) {
            this._scheduler = this._schedulerFactory();
        }

        if (!this._scheduler) {
            throw new Error("Projector: no scheduler.");
        }
    }
}
