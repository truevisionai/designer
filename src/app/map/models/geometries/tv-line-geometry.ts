/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, LineCurve, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvLineGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.LINE;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		super( s, x, y, hdg, length );

	}

	get start (): Vector2 {

		return new Vector2( this.x, this.y );

	}

	get end (): Vector2 {

		return this.getPositionAt( this.endS ).toVector2();

	}

	get endV3 (): Vector3 {

		return this.getPositionAt( this.endS ).toVector3();

	}

	getCurve (): Curve<Vector2> {

		return new LineCurve( this.start, this.end );

	}

	computeVars () {

		/*nothing*/

	}

	clone () {

		return new TvLineGeometry( this.s, this.x, this.y, this.hdg, this.length );

	}

	getRoadCoord ( s: number ): TvPosTheta {

		const ds = s - this.s;

		return new TvPosTheta(
			this.x + Math.cos( this.hdg ) * ds,
			this.y + Math.sin( this.hdg ) * ds,
			this.hdg,
			s
		);

	}

	public getNearestPointFrom ( x: number, y: number, posTheta?: TvPosTheta ): Vector2 {

		return super.getNearestPointFrom( x, y, posTheta );

	}

	getStCoordinates ( posTheta: TvPosTheta ) {

		const objPosition = new Vector2( posTheta.x, posTheta.y );

		// get nearest point on road from this new point
		const nearestPointOnRoad = this.getNearestPointFrom( objPosition.x, objPosition.y );

		// Debug.log( nearestPointOnRoad );

		// s value is simply the distance from start to the nearestPointOnRoad
		const s = ( new Vector2( this.x, this.y ) ).distanceTo( nearestPointOnRoad );

		// TODO: Find negative t value as well
		// t value is simple the distance from nearPointOnRoad to object position
		const t = nearestPointOnRoad.distanceTo( objPosition );

		posTheta.s = s;
		posTheta.t = t;
		posTheta.hdg = this.hdg;

		return new Vector2( s, t );
	}

}
