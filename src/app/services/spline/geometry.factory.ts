/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PARACUBICFACTOR } from "app/core/shapes/spline-config";
import { HermiteSpline, Length } from "app/core/shapes/spline-data";
import { TvAbstractRoadGeometry } from "app/map/models/geometries/tv-abstract-road-geometry";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvLineGeometry } from "app/map/models/geometries/tv-line-geometry";
import { TvParamPoly3Geometry } from "app/map/models/geometries/tv-param-poly3-geometry";
import { TvSpiralGeometry } from "app/map/models/geometries/tv-spiral-geometry";
import { TvGeometryType } from "app/map/models/tv-common";
import { RoadControlPoint } from "app/objects/road/road-control-point";
import { Maths } from "app/utils/maths";
import { getArcParams } from "app/utils/spline.utils";
import { Vector2 } from "three";

import * as SPIRAL from "../../core/shapes/spiral-math";

export abstract class GeometryFactory {

	static createFromPoint ( type: TvGeometryType, p1: RoadControlPoint, p2: RoadControlPoint ): TvAbstractRoadGeometry {

		switch ( type ) {
			case TvGeometryType.LINE:
				return this.createLineGeometry( p1, p2 );
			case TvGeometryType.ARC:
				return this.createArcGeometry( p1, p2 );
			case TvGeometryType.SPIRAL:
				return this.createSpiralGeometry( p1, p2 );
			case TvGeometryType.POLY3:
				break;
			case TvGeometryType.PARAMPOLY3:
				return this.createParamPoly3Geometry( p1, p2 );
			case TvGeometryType.SPLINE:
				break;
		}

	}

	private static createLineGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ): TvLineGeometry {

		return new TvLineGeometry( 0, p1.position.x, p1.position.y, p1.hdg, p1.position.distanceTo( p2.position ) );

	}

	private static createArcGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ): TvArcGeometry {

		const start = new Vector2( p1.position.x, p1.position.y );
		const end = new Vector2( p2.position.x, p2.position.y );

		const dir1 = new Vector2( Math.cos( p1.hdg ), Math.sin( p1.hdg ) );
		const dir2 = new Vector2( Math.cos( p2.hdg ), Math.sin( p2.hdg ) );

		const distance = p1.position.distanceTo( p2.position );

		const x = p1.position.x;
		const y = p1.position.y;

		const hdg = p1.hdg;

		let radius, alpha, sign;
		[ radius, alpha, length, sign ] = getArcParams( start, end, dir1, dir2 );

		// world z is flipped so inverse the sign
		// const curvature = + ( sign < 0 ? 1 : -1 ) + 1 / r;
		let curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / radius );  // sign < for mirror image

		// if radius if infinite then curvature should be the least possible value
		// so its almost close to a line but still an arc
		if ( radius === Infinity ) curvature = Number.MIN_VALUE;

		// because its alsmot a line we can take the arc length as the simple distance between the points
		if ( radius === Infinity ) length = distance;

		return new TvArcGeometry( 0, x, y, hdg, length, curvature );
	}

	private static createSpiralGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ): TvSpiralGeometry | TvLineGeometry {

		const dir1 = new Vector2( Math.cos( p1.hdg ), Math.sin( p1.hdg ) );
		const dir2 = new Vector2( Math.cos( p2.hdg ), Math.sin( p2.hdg ) );

		const [ k, dk, _L, iter ] = SPIRAL.buildClothoid(
			p1.position.x,
			p1.position.y,
			SPIRAL.vec2Angle( dir1.x, dir1.y ),
			p2.position.x,
			p2.position.y,
			SPIRAL.vec2Angle( dir2.x, dir2.y )
		);

		const x = p1.position.x;
		const y = p1.position.y;

		const hdg = p1.hdg;

		const length = _L;

		const curvStart = k;
		const curvEnd = ( k + dk * _L );

		if (
			Maths.approxEquals( curvStart, 0, 0.0001 ) &&
			Maths.approxEquals( curvEnd, 0, 0.0001 )
		) {
			p1.segmentType = TvGeometryType.LINE;
			return this.createLineGeometry( p1, p2 );
		}

		return new TvSpiralGeometry( 0, x, y, hdg, length, curvStart, curvEnd );

	}

	private static createParamPoly3Geometry ( start: RoadControlPoint, end: RoadControlPoint ): TvParamPoly3Geometry {

		const p1 = new Vector2( start.position.x, start.position.y );
		const p2 = new Vector2( end.position.x, end.position.y );

		const dir1 = new Vector2( Math.cos( start.hdg ), Math.sin( start.hdg ) );
		const dir2 = new Vector2( Math.cos( end.hdg ), Math.sin( end.hdg ) );

		const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

		const det = 1 / ( ma * md - mb * mc );

		const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

		const dir2proj = new Vector2(
			dir2.x * mia + dir2.y * mic,
			dir2.x * mib + dir2.y * mid
		);

		/*flip y axis*/
		dir2proj.y = -dir2proj.y;

		const p2proj = new Vector2().subVectors( p2, p1 );

		p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

		/*flip y axis*/
		p2proj.y = -p2proj.y;

		const x = p1.x;
		const y = p1.y;

		const hdg = start.hdg;

		length = p1.distanceTo( p2 ); // TODO fix this

		const tangent1Length = 7; // hdgs[ i ][ 1 ]
		const tangent2Length = 7; // hdgs[ i + 1 ][ 2 ]

		const t1 = new Vector2( 1, 0 ).multiplyScalar( PARACUBICFACTOR * tangent1Length );
		const t2 = new Vector2( dir2proj.x, dir2proj.y ).multiplyScalar( PARACUBICFACTOR * tangent2Length );

		const hs = HermiteSpline( new Vector2( 0, 0 ), p2proj, t1, t2 );

		length = Length( hs, 0.001 );

		const f3 = new Vector2( -2 * p2proj.x + 1 * t1.x + 1 * t2.x, -2 * p2proj.y + 1 * t1.y + 1 * t2.y );
		const f2 = new Vector2( 3 * p2proj.x - 2 * t1.x - 1 * t2.x, 3 * p2proj.y - 2 * t1.y - 1 * t2.y );
		const f1 = new Vector2( 1 * t1.x, 1 * t1.y );

		const aU = 0;
		const bU = f1.x;
		const cU = f2.x;
		const dU = f3.x;

		const aV = 0;
		const bV = f1.y;
		const cV = f2.y;
		const dV = f3.y;

		return new TvParamPoly3Geometry( 0, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV )

	}

}
