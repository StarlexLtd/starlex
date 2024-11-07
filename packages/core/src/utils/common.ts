import { PatchFlags } from "$/consts";
import { Decorator } from "$/patterns";

export function isDecorator<T>(d: any): d is Decorator<T> {
    return d[PatchFlags.IsDecorator] || d instanceof Decorator;
}

export function isHook(o: any): boolean {
    return o[PatchFlags.IsHook];
}

export function isProxy(p: any): boolean {
    return p[PatchFlags.IsProxy];
}
