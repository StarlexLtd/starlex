import { tracking } from "@cyysummer/core";
import { Recorder } from "./recorder";

export function track<T>(initial: T): [T, Recorder<T>] {
    const recorder = new Recorder(initial);
    const tracked = tracking(initial, { onSet: recorder.record.bind(recorder) });
    return [tracked, recorder];
}

export * from "./effect-builder";
export * from "./projector";
export * from "./recorder";
export * from "./scheduler";
