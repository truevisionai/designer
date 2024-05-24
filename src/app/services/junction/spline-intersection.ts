/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Vector3 } from 'three';


export class SplineIntersection {
	constructor (
		public spline: AbstractSpline,
		public otherSpline: AbstractSpline,
		public position: Vector3,
		public angle?: number
	) {
	}
}
