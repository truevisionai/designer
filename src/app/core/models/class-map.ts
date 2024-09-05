// A generic constructor function type that creates instances of T
export type ConstructorFunction<T = any> = new ( ...args: any[] ) => T;


export class ClassMap<V> extends Map<ConstructorFunction, V> {

}
