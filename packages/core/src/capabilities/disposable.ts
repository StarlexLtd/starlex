export type Disposable =
    | (() => void)
    | { dispose(): void; };

export function withDisposable<TBase extends Constructor>(Base: TBase = Object as unknown as TBase) {
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

            // 反向释放更安全（栈语义）
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
