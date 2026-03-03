// export type Capability<TInstance, TBase extends Constructor> = TBase & Constructor<InstanceType<TBase> & TInstance>;

export type Capability<TExtension, TBase extends Constructor> =
    & TBase
    & Constructor<InstanceType<TBase> & TExtension>
    & {
        // readonly [CAPABILITY]: TTag;
    };

// export type Capability<TIn extends Constructor, TOut extends Constructor> = (Base: TIn) => TOut;

/*
type InstanceOf<C> =
    C extends (base: any) => new (...args: any[]) => infer I
    ? I
    : never;

type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends
    (k: infer I) => void
    ? I
    : never;

type ApplyCapabilities<
    TBase extends Constructor,
    TCaps extends readonly Capability<any, any>[]
> =
    new (
        ...args: ConstructorParameters<TBase>
    ) => InstanceType<TBase> &
        UnionToIntersection<InstanceOf<TCaps[number]>>;

export function withCapabilities<
    TBase extends Constructor,
    TCaps extends readonly Capability<any, any>[]
>(
    Base: TBase,
    ...caps: TCaps
): ApplyCapabilities<TBase, TCaps> {
    return caps.reduce(
        (Current, cap) => cap(Current),
        Base
    ) as any;
}
*/
