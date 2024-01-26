/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SplineControlPoint } from "../objects/spline-control-point";
import { AbstractSpline } from "../core/shapes/abstract-spline";

export class ControlPointRemovedEvent {
	constructor ( public controlPoint: SplineControlPoint, public spline: AbstractSpline ) {
	}
}