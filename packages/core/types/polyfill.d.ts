declare global {
    interface Math {

        /**
         * Generate a random integer between [0, max].
         * Prefer to use Web Crypto, falling back to Math.random() on failure.
         *
         * @param max Upper bound (inclusive).
         * @returns A random integer within the range.
         *
         * @example
         * Math.randomInt(100)      // 0 ~ 100
         * Math.randomInt(1)        // 0 or 1
         *
         * @throws {TypeError} When `max` is not a valid number.
         */
        randomInt(max: number): number;

        /**
         * Generate a random integer between [min, max].
         * Prefer to use Web Crypto, falling back to Math.random() on failure.
         *
         * @param min Lower bound (inclusive).
         * @param max Upper bound (inclusive).
         * @returns A random integer within the range.
         *
         * @example
         * Math.randomInt(1, 100)               // 1 ~ 100
         * Math.randomInt(0, 1)                 // 0 or 1
         * Math.randomInt(-50, 50)              // -50 ~ 50
         * Math.randomInt(1000000, 9999999)     // A seven-digital random integer
         *
         * @throws {TypeError} When `max` or `min` is not a valid number.
         * @throws {RangeError} When `min` is greater than `max`.
         */
        randomInt(min: number, max: number): number;
    }
}

export { };
