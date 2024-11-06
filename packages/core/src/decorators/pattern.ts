import { PatchFlags } from "$/consts";
import { assert } from "$/utils";

export abstract class Decorator<T> {
    constructor(public readonly target: T) {
        assert.ok(target, `'target' is required.`);

        //@ts-ignore
        this[PatchFlags.IsDecorator] = true;
    }

    static Create<D extends Decorator<T>, T>(decorator: D): T {
        return new Proxy<D>(decorator, {
            get(target: D, prop: string | symbol, receiver: any) {
                if (prop in target) {
                    // 如果属性存在于装饰器上，那么直接调用
                    return Reflect.get(target, prop, receiver);
                } else if (prop === PatchFlags.IsProxy) {
                    // 表明自己是代理
                    return true;
                } else {
                    // 装饰器上不存在的属性，从被装饰的对象上调用。
                    //@ts-ignore
                    return target.target[prop];
                }
            }
        }) as unknown as T;
    }
}
