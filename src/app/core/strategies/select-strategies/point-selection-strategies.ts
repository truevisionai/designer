/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ObjectNameStrategy } from "./object-name-strategy";
import { SplineControlPoint } from "../../../objects/road/spline-control-point";
import { RoadControlPoint } from "../../../objects/road/road-control-point";
import { RoadTangentPoint } from "../../../objects/road/road-tangent-point";
import { ObjectTagStrategy } from "./object-tag-strategy";

export class SplineControlPointSelectionStrategy extends ObjectNameStrategy<SplineControlPoint> {
	constructor () {
		super( SplineControlPoint.name );
	}
}

export class RoadControlPointSelectionStrategy extends ObjectTagStrategy<RoadControlPoint> {
	constructor () {
		super( RoadControlPoint.tag );
	}
}

export class RoadTangentPointSelectionStrategy extends ObjectTagStrategy<RoadTangentPoint> {
	constructor () {
		super( RoadTangentPoint.tag );
	}
}
