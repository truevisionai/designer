/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, Vector2 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvSplineGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.SPLINE;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		super( s, x, y, hdg, length );

	}

	getCoords ( sCheck: any, posTheta: TvPosTheta ): TvGeometryType {

		throw new Error( 'Method not implemented.' );

	}

	computeVars () {

		throw new Error( 'Method not implemented.' );

	}

	getCurve (): Curve<Vector2> {

		throw new Error( 'Method not implemented.' );

	}

}
