import { AbstractSpline } from "../../core/shapes/abstract-spline";

export class SplineUpdatedEvent {
	constructor ( public spline: AbstractSpline ) {
	}
}