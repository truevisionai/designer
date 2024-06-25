/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { AbstractSpline, SplineType } from "./abstract-spline";
import { CatmullRomCurve3, CurveType, Line, Vector3 } from "three";
import { TvPosTheta } from "../../map/models/tv-pos-theta";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';

export class CatmullRomSpline extends AbstractSpline {

	public type: SplineType = SplineType.CATMULLROM;

	public curve: CatmullRomCurve3;

	public mesh: Line;

	constructor ( closed = true, public curveType: CurveType = 'catmullrom', tension = 0.5 ) {

		super( closed, tension );

		this.curve = new CatmullRomCurve3( this.controlPointPositions, closed, curveType || 'catmullrom', tension );

	}

	init (): void {


	}

	hide (): void {


	}

	hideLines () {


	}

	showLines () {


	}

	show (): void {


	}

	getLength () {

		return this.curve.getLength();

	}

	getPoints ( spacing = 10 ): Vector3[] {

		return this.curve.getPoints( spacing );

	}

	update (): void {

		//

	}

	exportGeometries ( duringImport?: boolean ): TvAbstractRoadGeometry[] {

		return [];

	}

	getPoint ( t: number, offset: number ): TvPosTheta {

		return null;

	}

	insertPoint ( point: AbstractControlPoint ) {

		// If the spline is not closed, just add the point to the end
		if ( !this.closed ) {

			this.addControlPoint( point );

			this.update();

			return;

		}

		super.insertPoint( point );
	}

}
