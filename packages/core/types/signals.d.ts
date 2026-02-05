declare global {
    interface ISignal<T extends any> extends PromiseLike<T> {
        trigger(reason: T): void;
        readonly once: boolean;
        readonly reason?: T;
        readonly triggered: boolean;
    }

    interface ISignalController<T extends ISignal = ISignal> {
        readonly signal: T;
    }
}

export { };
