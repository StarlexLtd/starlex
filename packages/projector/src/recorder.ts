import type { IProjector, Patch } from "../types";

import { cloneDeep, debounce, set } from "lodash-es";
import { withEvents } from "@cyysummer/core";

type RecorderEvents = {
    record: { next: any; patches: Patch[]; };
};

/**
 * Record changes to an object.
 */
export abstract class RecorderBase<TSource extends object> extends withEvents<RecorderEvents>() {
    protected _paused = false;
    protected _projectorFactory?: Func<IProjector<TSource>>;
    protected _shadow: TSource;

    constructor(initial: TSource) {
        super();
        this._shadow = cloneDeep(initial);
    }

    /**
     * Receive changes from the tracked object.
     * @param path
     * @param value
     * @returns
     */
    public abstract receive(path: any[], value: any): void;

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
        this._projectorFactory = typeof arg === "function" ? arg : () => arg;
    }

    public pause() {
        this._paused = true;
    }

    public resume() {
        this._paused = false;
    }
}

export class Recorder<TSource extends object> extends RecorderBase<TSource> {
    /**
     * Receive changes from the tracked object.
     * @param path
     * @param value
     * @returns
     */
    public override receive(path: any[], value: any) {
        if (this._paused) return;

        // todo: what will happen after array changes?
        set(this._shadow, path, value);
        const patches: Patch[] = [{ path, value }];

        // Projection is lazy, only project when there is a projector.
        this._projectorFactory?.()?.project(this._shadow, ...patches);

        // todo: make sure `next` is sync-ed with `initial` changes.
        this.emit("record", { next: this._shadow, patches });
    }

}

export class LazyRecorder<TSource extends object> extends RecorderBase<TSource> {
    protected _buffer: Map<string, Patch> = new Map();

    constructor(initial: TSource, protected _wait: number = 500) {
        super(initial);
    }

    /**
     * Receive changes from the tracked object.
     * @param path
     * @param value
     * @returns
     */
    public override receive(path: any[], value: any) {
        if (this._paused) return;

        this._buffer.set(path.join("."), { path, value, });
        this.receiveCore();
    }

    protected readonly receiveCore = debounce(() => {
        // shallow copy and clear.
        const patches = [...this._buffer.values()];
        log.trace("LazyRecorder.receiveCore,", patches);
        this._buffer.clear();

        for (const item of patches) {
            set(this._shadow, item.path, item.value);
        }

        // Projection is lazy, only project when there is a projector.
        this._projectorFactory?.()?.project(this._shadow, ...patches);

        this.emit("record", { next: this._shadow, patches });
    }, this._wait, {
        trailing: true,
    });

}
