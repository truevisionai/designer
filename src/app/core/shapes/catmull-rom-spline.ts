/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomCurve3, CurveType, Vector3 } from "three";
import { AbstractSpline } from './abstract-spline';
import { SplineType } from './spline-type';
import { AbstractControlPoint } from "app/objects/abstract-control-point";

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

	addControlPoint ( value: AbstractControlPoint | Vector3 ): AbstractControlPoint {

		const controlPoint = super.addControlPoint( value );

		this.update();

		return controlPoint;
	}

	removeControlPoint ( point: AbstractControlPoint ): void {

		super.removeControlPoint( point );

		this.update();

	}

	setControlPoints ( points: AbstractControlPoint[] ): void {

		super.setControlPoints( points );

		this.update();

	}

	override getLength (): number {

		return this.curve?.getLength();

	}

	override getPoints ( stepSize: number = 10 ): Vector3[] {

		const length = this.getLength();
		const count = Math.floor( length / stepSize );

		return this.curve.getPoints( count );

	}

	updateSegmentGeometryAndBounds (): void {

		// this.curve.updateArcLengths();

	}


}
