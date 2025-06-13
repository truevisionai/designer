/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLateralProfileCrossfall } from './tv-lateral-profile-crossfall';
import { PolynomialArray } from "../../core/models/ordered-array";


/**
 * Superelevation does not change the actual width of a lane,
 * but it affects the projected width. The default value for superelevation is zero
 *
 * Superelevation has positive values for roads falling to the right side
 * and negative values for roads falling to the left side.
 *
 * Superelevation specifies the transverse slope along the road reference line.
 * Superelevation is constant in each cross section and can vary in road
 * reference line direction.
 */
export class TvSuperElevation extends ThirdOrderPolynom {

	clone (): TvSuperElevation {
		return new TvSuperElevation( this.s, this.a, this.b, this.c, this.d );
	}

}

export class TvLateralProfileShape {
	public s: number;
	public t: number;
	public a: number;
	public b: number;
	public c: number;
	public d: number;

	toXODR (): Record<string, number> {
		return {
			attr_s: this.s,
			attr_t: this.t,
			attr_a: this.a,
			attr_b: this.b,
			attr_c: this.c,
			attr_d: this.d,
		}
	}
}

export class TvLateralProfile {

	public superElevations: PolynomialArray<TvSuperElevation>;
	public crossfalls: TvLateralProfileCrossfall[];
	public shapes: TvLateralProfileShape[];

	constructor () {
		this.superElevations = new PolynomialArray<TvSuperElevation>();
		this.crossfalls = [];
		this.shapes = [];
	}

	getSuperElevationCount (): number {
		return this.superElevations.length;
	}

	getFirstSuperElevation (): TvSuperElevation {
		return this.superElevations.getFirst();
	}

	getLastSuperElevation (): TvSuperElevation {
		return this.superElevations.getLast();
	}

	getSuperElevationAt ( s: number ): TvSuperElevation {
		return this.superElevations.findAt( s );
	}

	getSuperElevationValue ( s: number ): number {
		return this.superElevations.findAt( s )?.getValue( s );
	}

	getSuperElevations (): TvSuperElevation[] {
		return this.superElevations.toArray();
	}

	getNextSuperElevation ( elevation: TvSuperElevation ): TvSuperElevation | undefined {
		return this.superElevations.getNext( elevation );
	}

	getShapes (): TvLateralProfileShape[] {
		return this.shapes;
	}

	createSuperElevation ( s: number, a: number, b: number, c: number, d: number ): void {
		this.superElevations.set( s, new TvSuperElevation( s, a, b, c, d ) );
	}

	addSuperElevation ( elevation: TvSuperElevation ): void {
		this.superElevations.set( elevation.s, elevation );
	}

	removeSuperElevation ( superElevation: TvSuperElevation ): void {
		this.superElevations.remove( superElevation );
	}

	addCrossfall ( crossfall: TvLateralProfileCrossfall ): void {
		this.crossfalls.push( crossfall );
	}

	addShape ( s: number, t: number, a: number, b: number, c: number, d: number ): void {

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

	computeCoefficients ( roadLength: number ): void {

		this.superElevations.computeCoefficients( roadLength );

	}

	// shape elements shall be defined in ascending order,
	// firstly according to the s-coordinate and
	// secondly according to the t-coordinate.
	sortShapes (): void {
		this.shapes.sort( ( a, b ) => {
			if ( a.s === b.s ) {
				return a.t - b.t;
			}
			return a.s - b.s;
		} );
	}

	toXODR (): Record<string, any> {
		return {
			superelevation: this.getSuperElevations().map( superElevation => superElevation.toXODR() ),
			shape: this.getShapes().map( shape => shape.toXODR() ),
			crossSectionSurface: [],
		}
	}

}
