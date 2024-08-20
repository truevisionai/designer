/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Log } from 'app/core/utils/log';
import { MathUtils } from 'three';

export class ThirdOrderPolynom {

	public readonly uuid: string;

	/**
	 * Constructor that initializes the polynom with base properties
	 *
	 * @param {number} s
	 * @param {number} a
	 * @param {number} b
	 * @param {number} c
	 * @param {number} d
	 */
	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		this._s = s;
		this._a = a;
		this._b = b;
		this._c = c;
		this._d = d;

		this.uuid = MathUtils.generateUUID();
	}

	protected _s: number;

	get s (): number {
		return this._s;
	}

	set s ( value: number ) {
		this._s = value;
	}

	protected _a: number;

	get a (): number {
		return this._a;
	}

	set a ( value: number ) {
		this._a = value;
	}

	protected _b: number;

	get b (): number {
		return this._b;
	}

	set b ( value: number ) {
		this._b = value;
	}

	protected _c: number;

	get c (): number {
		return this._c;
	}

	set c ( value: number ) {
		this._c = value;
	}

	protected _d: number;

	get d (): number {
		return this._d;
	}

	set d ( value: number ) {
		this._d = value;
	}

	/**
	 * Method to check if sample S is inside the record interval
	 *
	 * @param sOther
	 * @returns {boolean}
	 */
	checkInterval ( sOther ): boolean {

		return sOther >= this._s;

	}

	getValue ( sOffset: number ): number {

		if ( isNaN( sOffset ) ) {
			Log.error( 's in not a number' );
			return 0;
		}

		const ds = sOffset - this.s;

		return ( this.a ) +
			( this.b * ds ) +
			( this.c * ds * ds ) +
			( this.d * ds * ds * ds );
	}

	toString (): string {

		return `s: ${ this.s }, a: ${ this.a }, b: ${ this.b }, c: ${ this.c }, d: ${ this.d }`;

	}

}
