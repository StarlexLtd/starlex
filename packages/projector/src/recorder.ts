import type { Effect, IProjector, IScheduler, Patch, Schema } from "../types";

import { set } from "lodash-es";
import { withEvents } from "@cyysummer/core";

type RecorderEvents = {
    record: { next: any; patches: Patch[]; };
}

/**
 * Record changes to an object.
 */
export class Recorder<TSource extends object> extends withEvents<RecorderEvents>() {
    private _paused = false;
    private _shadow: TSource;

    constructor(initial: TSource) {
        super();
        this._shadow = structuredClone(initial);
    }

    public record(path: any[], value: any) {
        if (this._paused) return;

        // todo: what will happen after array changes?
        set(this._shadow, path, value);
        // todo: make sure `next` is sync-ed with `initial` changes.
        this.emit("record", { next: this._shadow, patches: [{ path, value }] });
    }

    public pause() {
        this._paused = true;
    }

    public resume() {
        this._paused = false;
    }
}
