/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class ManagedMap<V> extends Map<number, V> {

	private used = new Set<number>();

	private removed: number[] = [];

	private highest: number = 0;

	constructor () {
		super();
	}

	set ( id: number, value: V ): this {

		this.used.add( id );

		this.removed = this.removed.filter( removedId => removedId !== id );

		this.highest = Math.max( this.highest, id );

		return super.set( id, value );

	}

	has ( id: number ): boolean {

		return super.has( id );

		// used set is not required as we are using map
		return this.used.has( id ) || super.has( id );

	}

	clear (): void {

		super.clear();

		this.used.clear();

		this.removed = [];

		this.highest = 0;

	}

	delete ( id: number ): boolean {

		if ( !this.used.has( id ) ) {
			return false;
		}

		this.used.delete( id );

		this.removed.push( id );

		return super.delete( id );

	}

	next ( useRemoved: boolean = true ): number {

		let id: number;

		if ( useRemoved && this.removed.length > 0 ) {

			id = this.removed.shift(); // Take the smallest ID from the sorted array

		} else {

			id = this.highest + 1;

		}

		this.used.add( id );

		this.highest = Math.max( this.highest, id );

		return id;

	}

	includes ( value: V ): boolean {

		return this.toArray().includes( value );

	}

	toArray (): V[] {

		return Array.from( this.values() );

	}

}
