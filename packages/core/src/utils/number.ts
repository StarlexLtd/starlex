/**
 * Return a random integer between [0, max].
 * @param max Max
 */
export function randomInt(max: number): number;

/**
 * Return a random integer between [min, max].
 * @param min Min
 * @param max Max
 */
export function randomInt(min: number, max: number): number;

/**
 * Return a random integer between [min, max].
 * Try to use Web Crypto first, otherwise downgrade to Math.random().
 */
export function randomInt(min: number, max?: number): number {
    max = max ?? min;
    min = (!!max) ? min : 0;

    if (max < min) {
        throw new RangeError("max must be >= min");
    }

    const range = max - min + 1;

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
                return min + (x % range);
            }
        }
    }

    // Downgrade
    return min + Math.floor(Math.random() * range);
}
