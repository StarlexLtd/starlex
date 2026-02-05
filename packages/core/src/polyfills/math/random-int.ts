/**
 * Generate a random integer between [0, max].
 * @param max Max
 */
export function randomInt(max: number): number;

/**
 * Generate a random integer between [min, max].
 * @param min Min
 * @param max Max
 */
export function randomInt(min: number, max: number): number;

/**
 * Generate a random integer between [min, max].
 * Prefer to use Web Crypto, falling back to Math.random() on failure.
 */
export function randomInt(min: number, max?: number): number {
    if (min == null) {
        throw new TypeError("Math.randomInt: missing min/max parameters.");
    }

    // Detect and normalize `max`. If not exists, use `min`.
    const actualMin = Math.floor(Number((!!max) ? min : 0));
    // Detect and normalize `min`. If `max` exists, use `min`, otherwise use 0.
    const actualMax = Math.floor(Number(max ?? min));

    // `min` and `max`(if exists) must be finite numbers
    if (!Number.isFinite(actualMin) || !Number.isFinite(actualMax) || Number.isNaN(actualMin) || Number.isNaN(actualMax)) {
        throw new TypeError(`Math.randomInt: min/max must be finite and valid numbers. We got min=${actualMin}, max=${actualMax}`);
    }

    if (actualMax < actualMin) {
        throw new RangeError("Math.randomInt: max must be >= min.");
    }

    const range = actualMax - actualMin + 1;

    // Max allowed range
    const MAX_UINT32 = 0xffffffff;
    const limit = MAX_UINT32 - (MAX_UINT32 % range);

    const cryptoObj = globalThis.crypto;

    if (cryptoObj?.getRandomValues) {
        const arr = new Uint32Array(1);

        while (true) {
            cryptoObj.getRandomValues(arr);
            const x = arr[0];
            if (x < limit) {
                return actualMin + (x % range);
            }
        }
    }

    // Downgrade
    return actualMin + Math.floor(Math.random() * range);
}
