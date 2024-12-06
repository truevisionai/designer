/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from "../../map/models/third-order-polynom";
import { Maths } from "../../utils/maths";

export class OrderedArry<T> {

	protected entries: T[] = [];

	constructor ( private key: string = 's' ) {

	}

	get length () {
		return this.entries.length;
	}

	clear (): void {
		this.entries = [];
	}

	set ( key: number, value: T, sort: boolean = true ): this {

		// if the value is already in the array, we don't add it
		if ( this.contains( value ) ) return this;

		// if we already have an entry with the same s value, we don't add it
		if ( this.entries.find( entry => Maths.approxEquals( entry[ this.key ], key ) ) ) {
			return this;
		}

		value[ this.key ] = key;

		this.entries.push( value );

		if ( sort ) this.sort();

		return this;
	}

	sort (): void {

		this.entries.sort( ( a, b ) => a[ this.key ] - b[ this.key ] );

	}

	toArray (): T[] {

		return this.entries;

	}

	contains ( value: T ): boolean {

		return this.entries.includes( value );

	}

	remove ( value: T ): void {

		this.entries = this.entries.filter( entry => entry !== value );

	}

	findKey ( value: T ): number | null {

		const entry = this.entries.find( entry => entry === value );

		return entry ? entry[ this.key ] : null

	}

	getPrevious ( value: T ): T | null {

		const index = this.entries.indexOf( value );

		if ( index === -1 ) {
			return null;
		}

		return this.entries[ index - 1 ] || null;
	}

	getNext ( value: T ): T | null {

		const index = this.entries.indexOf( value );

		if ( index === -1 ) {
			return null;
		}

		if ( index === this.entries.length - 1 ) {
			return null;
		}

		return this.entries[ index + 1 ] || null;

	}

	getNextKey ( value: T ): any {

		const next = this.getNext( value );

		if ( next === null ) {
			return null;
		}

		return next[ this.key ];

	}

	getLast (): T {

		return this.entries.length > 0 ? this.entries[ this.entries.length - 1 ] : null;

	}

	getFirst (): T {

		return this.entries.length > 0 ? this.entries[ 0 ] : null;

	}

	findAt ( query: number ): T | undefined {

		let item = null;

		for ( const entry of this.entries ) {

			if ( query >= entry[ this.key ] ) item = entry;

		}

		return item;

	}

	hasKey ( key: number ): boolean {

		return this.entries.find( entry => Maths.approxEquals( key, entry[ this.key ] ) ) != undefined;

	}

	forEach ( callbackfn: ( value: T, key: number, values: T[] ) => void, thisArg?: any ): void {

		for ( const entry of this.entries ) {
			callbackfn.call( thisArg, entry, entry[ this.key ], this.entries );
		}

	}

	map<U> ( callbackfn: ( value: T, key: number, values: T[] ) => U, thisArg?: any ): U[] {

		const result: U[] = [];

		for ( const entry of this.entries ) {
			result.push( callbackfn.call( thisArg, entry, entry[ this.key ], this.entries ) );
		}

		return result;
	}

}

export class PolynomialArray<T extends ThirdOrderPolynom> extends OrderedArry<T> {

	constructor () {
		super( 's' );
	}

	push ( item: T ): void {

		this.entries.push( item );

	}

	computeCoefficients ( sectionLength: number ): void {

		if ( this.entries.length < 2 ) return;

		for ( let i = 0; i < this.entries.length; i++ ) {

			const current = this.entries[ i ];

			let valueStart, valueEnd, derivStart, derivEnd, length;

			if ( ( i + 1 ) < this.entries.length ) {

				const next = this.entries[ i + 1 ];

				// next s cannot be less than current so we need to clamp it
				if ( next.s <= current.s ) {

					next.s = current.s + 0.1;

				}

				length = next.s - current.s;

				valueStart = current.a;          // value at start
				valueEnd = next.a;               // value at end
				derivStart = current.b;          // derivative at start
				derivEnd = next.b;               // derivative at end

			} else {

				// take lane section length
				length = sectionLength;

				valueStart = current.a;          // value at start
				valueEnd = current.a;            // value at end
				derivStart = current.b;          // derivative at start
				derivEnd = current.b;            // derivative at end

			}

			let a = valueStart;
			let b = derivStart;
			let c = ( -3 * valueStart ) + ( 3 * valueEnd ) + ( -2 * derivStart ) + ( -1 * derivEnd );
			let d = ( 2 * valueStart ) + ( -2 * valueEnd ) + ( 1 * derivStart ) + ( 1 * derivEnd );

			b /= length;
			c /= length * length;
			d /= length * length * length;

			current.a = a;
			current.b = b;
			current.c = c;
			current.d = d;

		}

	}

}
