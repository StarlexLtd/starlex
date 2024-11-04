/**
 * 将类构造函数转换为一个可调用的函数，该函数既可以使用 `new` 实例化，也可以像普通函数一样调用。
 * 
 * 当使用 `new` 调用时，它的行为与普通构造函数相同。
 * 当不使用 `new` 调用时，它表现为一个工厂函数，返回该类的实例。
 * 
 * @template T - 类构造函数的类型。
 * @param {T} Class - 要转换的类构造函数。
 * @returns {T & ((...args: ConstructorParameters<T>) => InstanceType<T>)} 
 *          可调用版本的构造函数，既可以使用 `new`，也可以直接调用。
 * 
 * @example
 * class Person {
 *     constructor(public name: string, public age: number) {}
 *     greet() {
 *         return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
 *     }
 * }
 * 
 * const CallablePerson = makeCallable(Person);
 * 
 * const p1 = new CallablePerson("John", 30); // 使用 `new` 实例化
 * console.log(p1.greet()); // 输出: Hello, I'm John and I'm 30 years old.
 * 
 * const p2 = CallablePerson("Jane", 25); // 直接调用，不使用 `new`
 * console.log(p2.greet()); // 输出: Hello, I'm Jane and I'm 25 years old.
*/
export function makeCallable<T extends new (...args: any[]) => any>(Class: T): T & ((...args: ConstructorParameters<T>) => InstanceType<T>) {
    const callable = function (...args: ConstructorParameters<T>) {
        return new Class(...args);
    } as T & ((...args: ConstructorParameters<T>) => InstanceType<T>);

    // 将 Class 的原型属性复制到 callable 上，以便在直接调用时能够访问到 Class 的原型方法
    Object.setPrototypeOf(callable, Class.prototype);

    return callable;
}
