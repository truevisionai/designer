import { SplineControlPoint } from "../modules/three-js/objects/spline-control-point";
import { AbstractSpline } from "../core/shapes/abstract-spline";

export class ControlPointRemovedEvent {
	constructor ( public controlPoint: SplineControlPoint, public spline: AbstractSpline ) {
	}
}