import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Group } from "three";
import { BaseView } from "./BaseView";
import { IView } from "./IView";


export class SplinePointsView extends Group implements IView {

	private points: BaseView[] = [];

	constructor ( public spline: AbstractSpline ) {
		super();
		this.points = spline.getControlPoints();
		this.points.forEach( point => this.add( point ) );
		this.points.forEach( point => point.hide() );
	}

	show (): void {
		this.points.forEach( point => point.show() );
	}

	hide (): void {
		this.points.forEach( point => point.hide() );
	}

	update (): void {
		// this.points.forEach( point => point.update() );
	}

	onMouseOver (): void {
		// this.points.forEach( point => point.onMouseOver() );
	}

	onMouseOut (): void {
		// this.points.forEach( point => point.onMouseOut() );
	}

	onClick (): void {
		// this.points.forEach( point => point.select() );
	}

	onDeselect (): void {
		// this.points.forEach( point => point.unselect() );
	}

}
