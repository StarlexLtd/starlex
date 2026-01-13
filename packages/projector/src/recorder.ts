import type { Patch } from "immer";

import { withEvents } from "@cyysummer/core";
import { produceWithPatches } from "immer";
import { set } from "lodash-es";

type RecorderEvents = {
    record: { next: any; patches: Patch[]; };
}

/**
 * Record changes to an object.
 */
export class Recorder<T> extends withEvents<RecorderEvents>() {
    private _shadow: T;
    private _terminated = false;

    constructor(initial: T) {
        super();
        this._shadow = structuredClone(initial);
    }

    public record(path: any[], value: any) {
        if (this._terminated) return;

        const [next, patches] = produceWithPatches<T>(this._shadow, (draft) => {
            set(draft as any, path, value);
        });
        this._shadow = next;
        this.emit("record", { next, patches });
    }

    public start() {
        this._terminated = false;
    }

    public stop() {
        this._terminated = true;
    }
}
