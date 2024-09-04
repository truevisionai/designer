/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ObjectNameStrategy } from "./object-name-strategy";
import { SplineControlPoint } from "../../../objects/road/spline-control-point";
import { RoadControlPoint } from "../../../objects/road/road-control-point";
import { RoadTangentPoint } from "../../../objects/road/road-tangent-point";

export class SplineControlPointSelectionStrategy extends ObjectNameStrategy<SplineControlPoint> {
	constructor () {
		super( SplineControlPoint.name );
	}
}

export class RoadControlPointSelectionStrategy extends ObjectNameStrategy<RoadControlPoint> {
	constructor () {
		super( RoadControlPoint.name );
	}
}

export class RoadTangentPointSelectionStrategy extends ObjectNameStrategy<RoadTangentPoint> {
	constructor () {
		super( RoadTangentPoint.name );
	}
}