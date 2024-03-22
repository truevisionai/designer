/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, MathUtils, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';

export abstract class TvAbstractRoadGeometry {

	public readonly uuid: string;

	public abstract geometryType: TvGeometryType;

	public abstract getRoadCoord ( s: number ): TvPosTheta;

	public abstract computeVars ();

	public abstract getCurve (): Curve<Vector2>;

	public abstract clone (): TvAbstractRoadGeometry;

	private _s: number;

	private _x: number;

	private _y: number;

	private _hdg: number;

	private _length: number;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		this._s = s;
		this._x = x;
		this._y = y;
		this._hdg = hdg;
		this._length = length;
		this.uuid = MathUtils.generateUUID();
	}


	get s () {

		return this._s;

	}

	set s ( value: number ) {

		this._s = value;

	}

	get x () {

		return this._x;

	}

	set x ( value: number ) {

		this._x = value;

	}

	get y () {

		return this._y;

	}

	set y ( value: number ) {

		this._y = value;

	}

	get hdg () {

		return this._hdg;

	}

	set hdg ( value: number ) {

		this._hdg = value;

		this.computeVars();
	}

	get length () {

		return this._length;

	}

	set length ( value: number ) {

		this._length = value;

		this.computeVars();
	}

	get endS () {

		return this.s + this.length;

	}

	get startV3 (): Vector3 {

		return new Vector3( this.x, this.y, 0 );

	}

	static getTypeAsString ( geometryType: TvGeometryType ): string {

		if ( geometryType === TvGeometryType.LINE ) {

			return 'line';

		} else if ( geometryType === TvGeometryType.ARC ) {

			return 'arc';

		} else if ( geometryType === TvGeometryType.SPIRAL ) {

			return 'spiral';

		} else if ( geometryType === TvGeometryType.POLY3 ) {

			return 'poly3';

		} else if ( geometryType === TvGeometryType.PARAMPOLY3 ) {

			return 'paramPoly3';

		}

	}

	setBase ( s: number, x: number, y: number, hdg: number, length: number, recalculate: boolean ) {

		this._s = s;
		this._x = x;
		this._y = y;
		this._hdg = hdg;
		this._length = length;

		if ( recalculate ) {
			this.computeVars();
		}
	}

	checkInterval ( sCheck: number ): boolean {

		if ( ( sCheck >= this._s ) && ( sCheck <= this.endS ) ) {

			return true;

		}

		return false;
	}

	/**
	 * cuts the geometry at the given s and returns the new geometry
	 *
	 * @param s coordinate at which the geometry is to be cut
	 * @returns new geometries
	 */
	public cut ( s: number ): [ TvAbstractRoadGeometry, TvAbstractRoadGeometry ] {

		if ( s > this.endS ) throw new Error( `s: ${ s } is greater than endS: ${ this.endS }` );
		if ( s < this.s ) throw new Error( `s: ${ s } is less than startS: ${ this.s }` );

		if ( this.geometryType !== TvGeometryType.LINE && this.geometryType !== TvGeometryType.ARC ) {
			throw new Error( 'cutting is only supported for line and arc' );
		}

		const coord = this.getRoadCoord( s );

		const firstSection = this.clone();
		const secondSection = this.clone();

		secondSection.x = coord.x;
		secondSection.y = coord.y;
		secondSection.hdg = coord.hdg;
		secondSection.s = s;
		secondSection.length = this.endS - s;

		firstSection.length = s - this.s;

		return [ firstSection, secondSection ];

	}

	public getPositionAt ( s ) {

		return this.getRoadCoord( s );

	}

	public getNearestPointFrom ( x: number, y: number, posTheta?: TvPosTheta ): Vector2 {

		return this.binarySearch_GetNearestPoint( x, y, posTheta );
		// return this.loopToGetNearestPoint( x, y, posTheta );

	}

	polyeval ( t: number, v: Vector3 ): number {

		return ( v.x ) + ( v.y * t ) + ( v.z * t * t );
	}

	// protected loopToGetNearestPoint ( x: number, y: number, refPosTheta?: TvPosTheta ): Vector2 {
	//
	// 	let nearestPoint: Vector2 = null;
	//
	// 	const point = new Vector2( x, y );
	//
	// 	// const curve = this.getCurve();
	//
	// 	let tmpPosTheta = new TvPosTheta();
	//
	// 	let minDistance = Number.MAX_SAFE_INTEGER;
	//
	// 	// const curveLength = curve.getLength();
	//
	// 	for ( let s = this.s; s <= this.endS; s++ ) {
	//
	// 		tmpPosTheta = this.getRoadCoord( s );
	//
	// 		const distance = tmpPosTheta.toVector2().distanceTo( point );
	//
	// 		if ( distance < minDistance ) {
	//
	// 			minDistance = distance;
	// 			nearestPoint = tmpPosTheta.toVector2();
	//
	// 			if ( refPosTheta ) {
	//
	// 				refPosTheta.x = x;
	// 				refPosTheta.y = y;
	// 				refPosTheta.s = s;
	// 				refPosTheta.t = distance;
	// 				refPosTheta.hdg = tmpPosTheta.hdg;
	// 			}
	// 		}
	// 	}
	//
	// 	if ( nearestPoint == null ) {
	//
	// 		throw new Error( 'could not find the nearest point' );
	//
	// 	} else {
	//
	// 		if ( refPosTheta ) {
	//
	// 			// calculating the lane side for correct value of t
	//
	// 			const tmp1 = new TvPosTheta();
	// 			const tmp2 = new TvPosTheta();
	//
	// 			this.getRoadCoord( refPosTheta.s );
	// 			this.getRoadCoord( refPosTheta.s + 1 );
	//
	// 			const side = Maths.direction( tmp1.toVector3(), tmp2.toVector3(), refPosTheta.toVector3() );
	//
	// 			if ( side == TvSide.RIGHT ) refPosTheta.t *= -1;
	//
	// 		}
	//
	// 	}
	//
	// 	return nearestPoint;
	// }

	public endCoord (): TvPosTheta {

		return this.getRoadCoord( this.endS );

	}

	public get typeAsString (): string {

		return TvAbstractRoadGeometry.getTypeAsString( this.geometryType );

	}

	protected binarySearch_GetNearestPoint ( x: number, y: number, refPosTheta?: TvPosTheta ): Vector2 {

		const point = new Vector2( x, y );

		const tolerance = 1e-2;

		let start = this.s;
		let end = this.endS;

		while ( Math.abs( start - end ) >= tolerance ) {

			const s1 = ( 2 * start + end ) / 3;
			const s2 = ( start + 2 * end ) / 3;

			const pos1 = this.getRoadCoord( s1 );
			const pos2 = this.getRoadCoord( s2 );

			const distance1 = point.distanceToSquared( pos1.toVector2() );
			const distance2 = point.distanceToSquared( pos2.toVector2() );

			if ( distance1 < distance2 ) {
				end = s2;
			} else {
				start = s1;
			}
		}

		const s = ( start + end ) / 2;

		const tmpPosTheta = this.getRoadCoord( s );

		const nearestPoint = tmpPosTheta.toVector2();

		// old and inorrect way to calculte
		// const t = nearestPoint.distanceTo( point ) * Math.sign( point.y - nearestPoint.y );

		// new way to calculaye more accurately
		const directionVector = new Vector2( Math.cos( tmpPosTheta.hdg ), Math.sin( tmpPosTheta.hdg ) );
		const pointVector = new Vector2( point.x - tmpPosTheta.x, point.y - tmpPosTheta.y );
		const crossProduct = directionVector.x * pointVector.y - directionVector.y * pointVector.x;

		const t = nearestPoint.distanceTo( point ) * Math.sign( crossProduct );

		if ( refPosTheta ) {
			refPosTheta.x = tmpPosTheta.x;
			refPosTheta.y = tmpPosTheta.y;
			refPosTheta.s = s;
			refPosTheta.t = t;
			refPosTheta.hdg = tmpPosTheta.hdg;
		}

		return nearestPoint;
	}
}
