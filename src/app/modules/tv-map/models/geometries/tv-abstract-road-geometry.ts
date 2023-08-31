/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, MathUtils, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';

export abstract class TvAbstractRoadGeometry {

	public readonly uuid: string;
	public abstract geometryType: TvGeometryType;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		this._s = s;
		this._x = x;
		this._y = y;
		this._hdg = hdg;
		this._length = length;

		this._endS = s + length;

		this.uuid = MathUtils.generateUUID();
	}

	private _s: number;

	get s () {

		return this._s;

	}

	set s ( value: number ) {

		this._s = value;

		this._endS = this._s + this._length;
	}

	private _x: number;

	get x () {

		return this._x;

	}

	set x ( value: number ) {

		this._x = value;

	}

	private _y: number;

	get y () {

		return this._y;

	}

	set y ( value: number ) {

		this._y = value;

	}

	private _hdg: number;

	get hdg () {

		return this._hdg;

	}

	set hdg ( value: number ) {

		this._hdg = value;

		this.computeVars();
	}

	private _length: number;

	get length () {

		return this._length;

	}

	set length ( value: number ) {

		this._length = value;

		this._endS = this._s + this._length;

		this.computeVars();
	}

	protected _endS: number;

	get endS () {
		return this._endS;
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

	abstract getRoadCoord ( s: number ): TvPosTheta;

	abstract computeVars ();

	abstract getCurve (): Curve<Vector2>;

	abstract clone ( s: number ): TvAbstractRoadGeometry;

	setBase ( s: number, x: number, y: number, hdg: number, length: number, recalculate: boolean ) {

		this._s = s;
		this._x = x;
		this._y = y;
		this._hdg = hdg;
		this._length = length;

		this._endS = s + length;

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


	public updateControlPoints () {

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
