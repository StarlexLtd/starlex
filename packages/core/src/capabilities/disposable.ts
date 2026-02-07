import type { Capability } from "./base";

export type Disposable =
    | (() => void)
    | { dispose(): void; };

export interface IDisposable {
    dispose(): void;
}

type DisposableCapability<TBase extends Constructor> = Capability<IDisposable, TBase>;

export function withDisposable<TBase extends Constructor>(Base: TBase = Object as unknown as TBase): DisposableCapability<TBase> {
    return class DisposableEnhanced extends Base {
        readonly #disposables: Disposable[] = [];
        #disposed = false;

        /**
         * Add a disposable resource.
         */
        protected addDisposable(d: Disposable): void {
            if (this.#disposed) {
                // If `this` already disposed, dispose `d` instantly.
                disposeOf(d);
                return;
            }

            this.#disposables.push(d);
        }

        /**
         * Dispose resources.
         */
        dispose(): void {
            if (this.#disposed) return;
            this.#disposed = true;

            // Reverse-ordered
            for (let i = this.#disposables.length - 1; i >= 0; i--) {
                disposeOf(this.#disposables[i]);
            }

            this.#disposables.length = 0;
        }
    };
}

function disposeOf(d: Disposable): void {
    try {
        if (typeof d === "function") {
            d();
        } else {
            d.dispose();
        }
    } catch (err) {
        log.error("dispose error:", err);
    }
}
