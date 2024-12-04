/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomCurve3, CurveType, Vector3 } from 'three';
import { AbstractSpline } from './abstract-spline';
import { SplineType } from './spline-type';

export class CatmullRomSpline extends AbstractSpline {

	public type: SplineType = SplineType.CATMULLROM;

	public curve: CatmullRomCurve3;

	constructor ( closed = true, public curveType: CurveType = 'catmullrom', tension = 0.5 ) {

		super( closed, tension );

		this.curve = new CatmullRomCurve3( this.controlPointPositions, this.closed, this.curveType || 'catmullrom', this.tension );

	}

	update (): void {

		this.curve = new CatmullRomCurve3( this.controlPointPositions, this.closed, this.curveType || 'catmullrom', this.tension );

	}

	override getLength (): number {

		return this.curve?.getLength();

	}

	getPoints ( stepSize: number = 10 ): Vector3[] {

		return this.curve?.getPoints( stepSize ) || [];

	}

	updateSegmentGeometryAndBounds (): void {

		// this.curve.updateArcLengths();

	}


}
