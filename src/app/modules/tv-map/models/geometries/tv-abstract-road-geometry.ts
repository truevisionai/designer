/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, Vector2, Vector3 } from 'three';
import { MathUtils } from 'three';
import { Maths } from '../../../../utils/maths';
import { TvGeometryType, TvSide } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';

export abstract class TvAbstractRoadGeometry {

	public readonly uuid: string;

	public attr_S;
	public attr_x;
	public attr_y;
	public attr_hdg;
	public attr_length;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		this.attr_S = s;
		this.attr_x = x;
		this.attr_y = y;
		this.attr_hdg = hdg;
		this.attr_length = length;

		this._s2 = s + length;

		this.uuid = MathUtils.generateUUID();
	}

	protected _s2;

	get s2 () {

		return this._s2;

	}

	protected _geometryType: TvGeometryType;

	get geometryType (): TvGeometryType {
		return this._geometryType;
	}

	set geometryType ( type: TvGeometryType ) {
		this._geometryType = type;
	}

	get startV3 (): Vector3 {

		return new Vector3( this.x, this.y, 0 );

	}

	get s () {

		return this.attr_S;

	}

	set s ( value: number ) {

		this.attr_S = value;

		this._s2 = this.attr_S + this.attr_length;
	}

	get x () {

		return this.attr_x;

	}

	set x ( value: number ) {

		this.attr_x = value;

	}

	get y () {

		return this.attr_y;

	}

	set y ( value: number ) {

		this.attr_y = value;

	}

	get hdg () {

		return this.attr_hdg;

	}

	set hdg ( value: number ) {

		this.attr_hdg = value;

		this.computeVars();
	}

	get length () {

		return this.attr_length;

	}

	set length ( value: number ) {

		this.attr_length = value;

		this.computeVars();
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

		this.attr_S = s;
		this.attr_x = x;
		this.attr_y = y;
		this.attr_hdg = hdg;
		this.attr_length = length;

		this._s2 = s + length;

		if ( recalculate ) {
			this.computeVars();
		}
	}

	checkInterval ( sCheck: number ): boolean {

		if ( ( sCheck >= this.attr_S ) && ( sCheck <= this.s2 ) ) {

			return true;

		}

		return false;
	}

	abstract getCoords ( sCheck, posTheta: TvPosTheta );

	abstract computeVars ();

	abstract getCurve (): Curve<Vector2>;

	public updateControlPoints () {

	}

	public getNearestPointFrom ( x: number, y: number, posTheta?: TvPosTheta ): Vector2 {

		return this.loopToGetNearestPoint( x, y, posTheta );

	}

	polyeval ( t: number, v: Vector3 ): number {

		return ( v.x ) + ( v.y * t ) + ( v.z * t * t );
	}

	protected loopToGetNearestPoint ( x: number, y: number, refPosTheta?: TvPosTheta ): Vector2 {

		let nearestPoint: Vector2 = null;

		const point = new Vector2( x, y );

		// const curve = this.getCurve();

		const tmpPosTheta = new TvPosTheta();

		let minDistance = Number.MAX_SAFE_INTEGER;

		// const curveLength = curve.getLength();

		for ( let s = this.s; s <= this.s2; s++ ) {

			this.getCoords( s, tmpPosTheta );

			const distance = tmpPosTheta.toVector2().distanceTo( point );

			if ( distance < minDistance ) {

				minDistance = distance;
				nearestPoint = tmpPosTheta.toVector2();

				if ( refPosTheta ) {

					refPosTheta.x = x;
					refPosTheta.y = y;
					refPosTheta.s = s;
					refPosTheta.t = distance;
					refPosTheta.hdg = tmpPosTheta.hdg;
				}
			}
		}

		if ( nearestPoint == null ) {

			throw new Error( 'could not find the nearest point' );

		} else {

			if ( refPosTheta ) {

				// calculating the lane side for correct value of t

				const tmp1 = new TvPosTheta();
				const tmp2 = new TvPosTheta();

				this.getCoords( refPosTheta.s, tmp1 );
				this.getCoords( refPosTheta.s + 1, tmp2 );

				const side = Maths.direction( tmp1.toVector3(), tmp2.toVector3(), refPosTheta.toVector3() );

				if ( side == TvSide.RIGHT ) refPosTheta.t *= -1;

			}

		}

		return nearestPoint;
	}
}
