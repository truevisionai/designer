/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Box2, Vector2, Vector3 } from 'three';


export class SplineIntersection {

	public area: Box2;
	public start: Vector2;
	public end: Vector2;

	public splineStart: number;
	public splineEnd: number;

	public otherStart: number;
	public otherEnd: number;

	constructor (
		public spline: AbstractSpline,
		public otherSpline: AbstractSpline,
		public position: Vector3,
		public angle?: number
	) {
	}

}
