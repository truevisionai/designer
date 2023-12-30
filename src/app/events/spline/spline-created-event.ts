import { AbstractSpline } from "../../core/shapes/abstract-spline";

export class SplineCreatedEvent {
	constructor ( public spline: AbstractSpline ) {
	}
}