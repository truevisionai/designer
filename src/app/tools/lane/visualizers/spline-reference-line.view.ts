import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { DebugLine } from "app/objects/debug-line";
import { BaseView } from "./base.view";
import { IView } from "./i-view";


export class SplineReferenceLineView extends BaseView implements IView {

	private line: DebugLine<any>;

	constructor ( public spline: AbstractSpline ) {

		super();

		const points = spline.getCoords();

		const positions = points.map( point => point.position );

		this.line = DebugLine.create( positions );

		this.add( this.line );

	}

	show (): void {
		this.line.visible = true;
	}

	hide (): void {
		this.line.visible = false;
	}

	update (): void {
		this.line.updateGeometry( this.spline.getCoords().map( point => point.position ) );
		console.log( 'SplineReferenceLineView.update', this.spline.getCoords().map( point => point.position ) );
	}

	onMouseOver?(): void {
		this.line.onMouseOver();
	}

	onMouseOut?(): void {
		this.line.onMouseOut();
	}

	onClick?(): void {
		this.line.select();
	}

	onDeselect?(): void {
		this.line.unselect();
	}

}
