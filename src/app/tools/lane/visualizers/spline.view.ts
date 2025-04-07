import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { BaseView } from "./base.view";
import { IView } from "./i-view";
import { PointView } from "./point.view";
import { SplineBorderView } from "./spline-border.view";
import { SplinePolylineView } from "./spline-polyline.view";
import { SplineReferenceLineView } from "./spline-reference-line.view";


export class SplineView extends BaseView implements IView {

	private borderView: BaseView;
	private polyline: BaseView;
	private referenceLine: BaseView;
	private points: IView[] = [];

	constructor ( public spline: AbstractSpline ) {

		super();

		this.borderView = SplineBorderView.create( spline );

		this.polyline = new SplinePolylineView( spline );
		this.referenceLine = new SplineReferenceLineView( spline );

		spline.getControlPoints().forEach( point => {
			const view = PointView.create( point.position );
			view.hide();
			this.points.push( view );
			this.add( view );
		} );

		this.polyline.hide();
		this.referenceLine.hide();

		this.add( this.borderView );
		this.add( this.polyline );
		this.add( this.referenceLine );

	}

	show (): void {
		console.log( 'SplineView.show' );
		this.visible = true;
	}

	hide (): void {
		console.log( 'SplineView.hide' );
		this.visible = false;
	}

	update (): void {
		console.log( 'SplineView.update' );
		this.borderView.update();
		this.points.forEach( point => point.update() );
		this.polyline.update();
		this.referenceLine.update();
	}

	onMouseOver?(): void {
		console.log( 'SplineView.highlight' );
		this.borderView.show();
		this.borderView.onMouseOver();
	}

	onMouseOut?(): void {
		console.log( 'SplineView.unhighlight' );
		this.borderView.hide();
		this.borderView.onMouseOut();
	}

	onClick?(): void {
		console.log( 'SplineView.onSelect' );
		this.borderView.show();
		this.borderView.onClick();
		this.points.forEach( point => point.show() );
		this.polyline.show();
		this.referenceLine.show();
	}

	onDeselect?(): void {
		console.log( 'SplineView.onDeselect' );
		this.borderView.hide();
		this.points.forEach( point => point.hide() );
		this.polyline.hide();
		this.referenceLine.hide();
	}

}
