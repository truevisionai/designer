/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class OrderedMap<T> extends Map<number, T> {

	constructor () {
		super();
	}

	set ( key: number, value: T, sort = true ): this {

		super.set( key, value );

		if ( sort ) this.sort();

		return this;
	}

	sort () {

		const entries = [ ...this.entries() ].sort( ( a, b ) => a[ 0 ] - b[ 0 ] );

		this.clear();

		for ( const [ key, value ] of entries ) {
			this.set( key, value, false );
		}

	}

	toArray (): T[] {

		return [ ...this.values() ];

	}

	contains ( value: T ) {

		return this.toArray().includes( value );

	}

	remove ( value: T ) {

		const key = this.findKey( value );

		if ( key !== null ) {
			this.delete( key );
		}

	}

	findKey ( value: T ): number | null {

		const entries = [ ...this.entries() ];

		const entry = entries.find( ( [ , v ] ) => v === value );

		return entry ? entry[ 0 ] : null;

	}

	getPrevious ( value: T ) {

		const values = this.toArray();

		const index = values.indexOf( value );

		if ( index === -1 ) {
			return null;
		}

		return values[ index - 1 ] || null;
	}

	getNext ( value: T ) {

		const values = this.toArray();

		const index = values.indexOf( value );

		if ( index === -1 ) {
			return null;
		}

		return values[ index + 1 ] || null;

	}

	getNextKey ( value: T ) {

		const next = this.getNext( value );

		if ( next === null ) {
			return null;
		}

		return this.findKey( next );

	}

	getLast () {

		const values = this.toArray();

		return values[ values.length - 1 ];

	}

	getFirst () {

		const values = this.toArray();

		return values[ 0 ];

	}

	findAt ( query: number ): T | undefined {

		let item = null;

		for ( const [ sOffset, value ] of this.entries() ) {

			if ( query >= sOffset ) item = value;

		}

		return item;

	}

	forEach ( callbackfn: ( value: T, key: number, map: Map<number, T> ) => void, thisArg?: any ) {

		for ( const [ key, value ] of this.entries() ) {
			callbackfn.call( thisArg, value, key, this );
		}
	}

	map<U> ( callbackfn: ( value: T, key: number, map: Map<number, T> ) => U, thisArg?: any ): U[] {

		const result: U[] = [];

		for ( const [ key, value ] of this.entries() ) {
			result.push( callbackfn.call( thisArg, value, key, this ) );
		}

		return result;
	}
}
