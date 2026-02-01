import { randomInt } from "./random-int";

export function polyfillMath(): void {
    if (!Math.randomInt) {
        Object.defineProperty(Math, "randomInt", {
            value: randomInt,
            writable: true,
            configurable: true,
            enumerable: false,
        });
    }
}

export default polyfillMath;
