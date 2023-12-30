import { AbstractSpline } from "../../core/shapes/abstract-spline";

export class SplineRemovedEvent {
	constructor ( public spline: AbstractSpline ) {
	}
}