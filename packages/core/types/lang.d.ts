declare global {
    export type Action = () => void;
    export type Action<T> = (arg: T) => void;
    export type Action2<T1, T2> = (arg1: T1, arg2: T2) => void;
    export type Action3<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;
    export type Action4<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void;

    export type Func<R> = () => R;
    export type Func1<T, R> = (arg: T) => R;
    export type Func2<T1, T2, R> = (arg1: T1, arg2: T2) => R;
    export type Func3<T1, T2, T3, R> = (arg1: T1, arg2: T2, arg3: T3) => R;
    export type Func4<T1, T2, T3, T4, R> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => R;

    export type ActionN<T extends any[] = []> = (...args: T) => void;
    export type FuncN<T extends any[] = [], R> = (...args: T) => R;

    export type ActionT5<T1 = void, T2 = void, T3 = void, T4 = void, T5 = void> =
        T5 extends void ?
        T4 extends void ?
        T3 extends void ?
        T2 extends void ?
        T1 extends void ?
        () => void
        : (arg1: T1) => void
        : (arg1: T1, arg2: T2) => void
        : (arg1: T1, arg2: T2, arg3: T3) => void
        : (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void
        : (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void;

    export type FuncT5<T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, R> =
        T5 extends void ?
        T4 extends void ?
        T3 extends void ?
        T2 extends void ?
        T1 extends void ?
        () => R
        : (arg1: T1) => R
        : (arg1: T1, arg2: T2) => R
        : (arg1: T1, arg2: T2, arg3: T3) => R
        : (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => R
        : (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => R;

    type ClassMethodDecoratorFunction<Fn extends (...args: any[]) => any> = (this: ThisParameterType<Fn>, ...args: Parameters<Fn>[]) => ReturnType<Fn>;
}

export { };
