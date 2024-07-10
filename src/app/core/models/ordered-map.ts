/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Debug } from "../utils/debug";

export class OrderedMap<T> {

	private internalMap: Map<number, T> = new Map();

	constructor () {
		this.internalMap = new Map();
	}

	get length () {
		return this.internalMap.size;
	}

	values () {
		return this.internalMap.values();
	}

	set ( key: number, value: T, sort = true ): this {

		// check if value is already present
		if ( this.contains( value ) ) {
			// remove the value
			Debug.log( value );
			Debug.log( 'Value already present in the map, removing it' );
			this.remove( value );
		}

		this.internalMap.set( key, value );

		if ( sort ) this.sort();

		return this;
	}

	sort () {

		const entries = [ ...this.internalMap.entries() ].sort( ( a, b ) => a[ 0 ] - b[ 0 ] );

		this.internalMap.clear();

		for ( const [ key, value ] of entries ) {
			this.set( key, value, false );
		}

	}

	toArray (): T[] {

		return [ ...this.internalMap.values() ];

	}

	contains ( value: T ) {

		return this.toArray().includes( value );

	}

	remove ( value: T ) {

		const key = this.findKey( value );

		if ( key !== null ) {
			this.internalMap.delete( key );
		}

	}

	findKey ( value: T ): number | null {

		const entries = [ ...this.internalMap.entries() ];

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

		for ( const [ sOffset, value ] of this.internalMap.entries() ) {

			if ( query >= sOffset ) item = value;

		}

		return item;

	}

	hasKey ( key: number ): boolean {

		return this.internalMap.has( key );

	}

	forEach ( callbackfn: ( value: T, key: number, map: Map<number, T> ) => void, thisArg?: any ) {

		for ( const [ key, value ] of this.internalMap.entries() ) {
			callbackfn.call( thisArg, value, key, this );
		}
	}

	map<U> ( callbackfn: ( value: T, key: number, map: Map<number, T> ) => U, thisArg?: any ): U[] {

		const result: U[] = [];

		for ( const [ key, value ] of this.internalMap.entries() ) {
			result.push( callbackfn.call( thisArg, value, key, this ) );
		}

		return result;
	}
}
