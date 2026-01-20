import type { IRecorder } from "types";

import onChange from "on-change";
import { LazyRecorder, Recorder } from "./recorder";

/**
 * Track changes to an object.
 * @param initial Source object to track. This must the raw object, not reactive-enabled object.
 * @param [wait=500] Wait before change notification. Useful when the object changes at high frequency.
 * @returns A tuple of the tracked object and a recorder.
 */
export function track<TSource extends object>(initial: TSource, wait: number = 500): [TSource, IRecorder<TSource>] {
    const recorder = wait > 0 ? new LazyRecorder(initial, wait) :  new Recorder(initial);
    const tracked = onChange(
        initial,
        (path, value) => recorder.receive(path, value),
        { pathAsArray: true },
    );
    return [tracked, recorder];
}
