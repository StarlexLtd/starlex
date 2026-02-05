declare global {
    interface ISignal<T extends any = void> {
        promise: Promise<T>;
        cancel: Action;
    }
}

export { };
