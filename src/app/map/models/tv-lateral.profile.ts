/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OrderedMap } from 'app/core/models/ordered-map';
import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLateralProfileCrossfall } from './tv-lateral-profile-crossfall';

export class TvSuperElevation extends ThirdOrderPolynom {

}

export class TvLateralProfileShape {
	public s: number;
	public t: number;
	public a: number;
	public b: number;
	public c: number;
	public d: number;
}

export class TvLateralProfile {

	public superElevations: OrderedMap<TvSuperElevation>;
	public crossfalls: TvLateralProfileCrossfall[];
	public shapes: TvLateralProfileShape[];

	constructor () {
		this.superElevations = new OrderedMap<TvSuperElevation>();
		this.crossfalls = [];
		this.shapes = [];
	}

	addSuperElevation ( s: number, a: number, b: number, c: number, d: number ) {
		this.superElevations.set( s, new TvSuperElevation( s, a, b, c, d ) );
	}

	addCrossfall ( crossfall: TvLateralProfileCrossfall ) {
		this.crossfalls.push( crossfall );
	}

	addShape ( s: number, t: number, a: number, b: number, c: number, d: number ) {

		const shape = new TvLateralProfileShape();

		shape.s = s;
		shape.t = t;
		shape.a = a;
		shape.b = b;
		shape.c = c;
		shape.d = d;

		this.shapes.push( shape );

		this.sortShapes();

	}

	// shape elements shall be defined in ascending order,
	// firstly according to the s-coordinate and
	// secondly according to the t-coordinate.
	sortShapes () {
		this.shapes.sort( ( a, b ) => {
			if ( a.s === b.s ) {
				return a.t - b.t;
			}
			return a.s - b.s;
		} );
	}

}
