import { SplineControlPoint } from "../modules/three-js/objects/spline-control-point";

export class ControlPointCreatedEvent {
	constructor ( public controlPoint: SplineControlPoint ) {
	}
}