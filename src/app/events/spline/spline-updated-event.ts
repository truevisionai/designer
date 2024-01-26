/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "../../core/shapes/abstract-spline";

export class SplineUpdatedEvent {
	constructor ( public spline: AbstractSpline ) {
	}
}