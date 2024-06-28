/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomCurve3, Line, CurveType, Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';

export class CatmullRomSpline extends AbstractSpline {

	public type: SplineType = SplineType.CATMULLROM;

	public curve: CatmullRomCurve3;

	public mesh: Line;

	constructor ( closed = true, public curveType: CurveType = 'catmullrom', tension = 0.5 ) {

		super( closed, tension );

		this.curve = new CatmullRomCurve3( this.controlPointPositions, this.closed, this.curveType || 'catmullrom', this.tension );

	}

	update (): void {

		//

	}

	override getLength () {

		return this.curve?.getLength();

	}

	getPoints ( spacing = 10 ): Vector3[] {

		return this.curve?.getPoints( spacing );

	}

}
