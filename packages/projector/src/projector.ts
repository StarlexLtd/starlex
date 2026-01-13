import type { Patch } from "immer";

export class Projector<TSource> implements IProjector<TSource> {
    constructor(private _schema: Schema<TSource>, private _scheduler: IScheduler<any>) {
    }

    public project(next: TSource, patches: Patch[]) {
        if (!this._schema) {
            throw new Error("Schema not loaded");
        }

        for (const patch of patches) {
            this._dispatch(next, patch);
        }
    }

    private _dispatch(next: TSource, patch: Patch) {
        const { path, op, value } = patch;
        const effect = this._resolveEffect(path);
        if (!effect) return;

        this._scheduler.enqueue({
            path: path.join("."),
            effect,
            ctx: {
                source: next,
                path,
                value,
            }
        });
    }

    private _resolveEffect(path: (string | number)[]): Effect<TSource, any> | null {
        let node = this._schema;
        for (const key of path) {
            if (!node) return null;
            // Force to read. If structure is not matched, return null and next loop will handle it.
            node = (node as any)[key];
        }

        return typeof node === "function" ? node : null;
    }
}
