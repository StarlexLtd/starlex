import { IS_DECORATOR, IS_PROXY } from "$/consts";
import { assert } from "$/utils";

export interface Decorator<T> {
    readonly target: T;
}

export abstract class Decorator<T> {
    constructor(public readonly target: T) {
        assert(target, `'target' is required.`);

        //@ts-ignore
        this[IS_DECORATOR] = true;
    }

    static Create<D extends Decorator<T>, T = D extends Decorator<infer K> ? K : never>(decorator: D): T & Decorator<T> {
        return new Proxy<D>(decorator, {
            get(target: D, prop: string | symbol, receiver: any) {
                if (prop in target) {
                    // 如果属性存在于装饰器上，那么直接调用
                    return Reflect.get(target, prop, receiver);
                } else if (prop === IS_PROXY) {
                    // 表明自己是代理
                    return true;
                } else {
                    // 装饰器上不存在的属性，从被装饰的对象上调用。
                    //@ts-ignore
                    return target.target[prop];
                }
            },
            set(target: D, prop: string | symbol, newValue: any, receiver: any) {
                if (prop in target) {
                    return Reflect.set(target, prop, newValue, receiver);
                } else if (prop === IS_PROXY) {
                    // PatchFlags 不能修改
                    return false;
                } else{
                    // 装饰器上不存在的属性，直接写入被装饰的对象。
                    //@ts-ignore
                    target.target[prop] = newValue;
                    return true;
                }
            },
        }) as any as T & Decorator<T>;
    }
}

export function decorate<T>(obj: T) {
    function by<D extends new (target: T) => Decorator<T>>(decoratorClass: D) {
        return Decorator.Create(new decoratorClass(obj));
    }

    return {
        by,
    };
}
