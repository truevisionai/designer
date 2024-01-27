export abstract class DataService<T> {

	abstract all (): T[];

	abstract add ( object: T ): void;

	abstract update ( object: T ): void;

	abstract remove ( object: T ): void;

}
