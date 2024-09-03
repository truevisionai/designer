/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SplineControlPoint } from "../objects/road/spline-control-point";

export class ControlPointCreatedEvent {
	constructor ( public controlPoint: SplineControlPoint ) {
	}
}