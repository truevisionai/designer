import { ThirdOrderPolynom } from "../../map/models/third-order-polynom";
import { Maths } from "../../utils/maths";
import { TvUtils } from "../../map/models/tv-utils";

export class OrderedArray<T extends ThirdOrderPolynom> {

	private entries: T[] = [];

	constructor () {
	}

	get length () {
		return this.entries.length;
	}

	set ( key: number, value: T, sort = true ): this {

		// if the value is already in the array, we don't add it
		if ( this.contains( value ) ) return this;

		// if we already have an entry with the same s value, we don't add it
		if ( this.entries.find( entry => Maths.approxEquals( entry.s, key ) ) ) {
			return this;
		}

		this.entries.push( value );

		if ( sort ) this.sort();

		return this;
	}

	sort () {

		this.entries.sort( ( a, b ) => a.s - b.s );

	}

	toArray (): T[] {

		return this.entries;

	}

	contains ( value: T ) {

		return this.entries.includes( value );

	}

	remove ( value: T ) {

		this.entries = this.entries.filter( entry => entry !== value );

	}

	findKey ( value: T ): number | null {

		const entry = this.entries.find( entry => entry === value );

		return entry ? entry.s : null

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

	getNextKey ( value: T ) {

		const next = this.getNext( value );

		if ( next === null ) {
			return null;
		}

		return next.s;

	}

	getLast () {

		return this.entries.length > 0 ? this.entries[ this.entries.length - 1 ] : null;

	}

	getFirst () {

		return this.entries.length > 0 ? this.entries[ 0 ] : null;

	}

	findAt ( query: number ): T | undefined {

		let item = null;

		for ( const entry of this.entries ) {

			if ( query >= entry.s ) item = entry;

		}

		return item;

	}

	forEach ( callbackfn: ( value: T, key: number, values: T[] ) => void, thisArg?: any ) {

		for ( const entry of this.entries ) {
			callbackfn.call( thisArg, entry, entry.s, this.entries );
		}

	}

	map<U> ( callbackfn: ( value: T, key: number, values: T[] ) => U, thisArg?: any ): U[] {

		const result: U[] = [];

		for ( const entry of this.entries ) {
			result.push( callbackfn.call( thisArg, entry, entry.s, this.entries ) );
		}

		return result;
	}

	computeCoefficients ( length: number ) {

		if ( this.entries.length === 0 ) return;

		TvUtils.computeCoefficients( this.entries, length );

	}

}
