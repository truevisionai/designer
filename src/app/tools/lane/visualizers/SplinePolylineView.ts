import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { DebugLine } from "app/objects/debug-line";
import { BaseView } from "./BaseView";
import { IView } from "./IView";


export class SplinePolylineView extends BaseView implements IView {

	private line: DebugLine<any>;

	constructor ( private spline: AbstractSpline ) {

		super();

		const points = spline.getControlPoints().map( point => point.position );

		if ( spline.closed && points.length > 2 ) {
			points.push( points[ 0 ] );
		}

		this.line = DebugLine.create( points );

		this.add( this.line );

	}

	show (): void {
		this.line.visible = true;
	}

	hide (): void {
		this.line.visible = false;
	}

	update (): void {
		this.line.updateGeometry( this.spline.getControlPoints().map( point => point.position ) );
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
