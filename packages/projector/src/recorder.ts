import type { IProjector, Patch } from "../types";

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
    private _projector?: IProjector<TSource>;
    private _projectorFactory?: Func<IProjector<TSource>>;
    private _shadow: TSource;

    constructor(initial: TSource) {
        super();
        this._shadow = structuredClone(initial);
    }

    /**
     * Receive changes from the tracked object.
     * @param path
     * @param value
     * @returns
     */
    public receive(path: any[], value: any) {
        if (this._paused) return;

        // todo: what will happen after array changes?
        set(this._shadow, path, value);
        const patches: Patch[] = [{ path, value }];
        // todo: make sure `next` is sync-ed with `initial` changes.
        this.emit("record", { next: this._shadow, patches });

        // Projection is lazy, only project when there is a projector.
        this._ensureProjector();
        this._projector?.project(this._shadow, ...patches);
    }

    /**
     * Send changes to a projector.
     * @param projector
     */
    public sendTo(projector: IProjector<TSource>): void;

    /**
     * Send changes to a projector.
     * @param factory
     */
    public sendTo(factory: Func<IProjector<TSource>>): void;
    public sendTo(arg: IProjector<TSource> | Func<IProjector<TSource>>): void {
        if (typeof arg === "function") {
            this._projectorFactory = arg;
        } else {
            this._projector = arg;
        }
    }

    public pause() {
        this._paused = true;
    }

    public resume() {
        this._paused = false;
    }

    private _ensureProjector() {
        if (!this._projector && this._projectorFactory) {
            this._projector = this._projectorFactory();
        }
    }
}
