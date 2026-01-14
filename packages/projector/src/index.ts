import onChange from "on-change";
import { Recorder } from "./recorder";

/**
 * Track changes to an object.
 * @param initial Source object to track. This must the raw object, not reactive-enabled object.
 * @returns A tuple of the tracked object and a recorder.
 */
export function track<TSource extends object>(initial: TSource): [TSource, Recorder<TSource>] {
    const recorder = new Recorder(initial);
    const tracked = onChange(initial, recorder.receive.bind(recorder), { pathAsArray: true });
    return [tracked, recorder];
}

export * from "./effect-builder";
export * from "./projector";
export * from "./recorder";
export * from "./scheduler";
