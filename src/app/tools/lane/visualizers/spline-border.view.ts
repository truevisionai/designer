/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { DebugLine } from "app/objects/debug-line";
import { IView } from "./i-view";
import { BaseView } from "./base.view";


export class SplineBorderView extends BaseView implements IView {

	isView: boolean = true;

	private leftBorder: DebugLine<any>;
	private rightBorder: DebugLine<any>;

	private constructor ( public spline: AbstractSpline ) {
		super();
	}

	show (): void {
		this.visible = true;
	}

	hide (): void {
		this.visible = false;
	}

	update (): void {
		this.leftBorder.updateGeometry( this.spline.leftPoints.map( point => point.position ) );
		this.rightBorder.updateGeometry( this.spline.rightPoints.map( point => point.position ) );
	}

	onMouseOver (): void {
		this.leftBorder.onMouseOver();
		this.rightBorder.onMouseOver();
	}

	onMouseOut (): void {
		this.leftBorder.onMouseOut();
		this.rightBorder.onMouseOut();
	}

	onClick (): void {
		this.leftBorder.select();
		this.rightBorder.select();
	}

	onDeselect (): void {
		this.leftBorder.unselect();
		this.rightBorder.unselect();
	}

	static create ( spline: AbstractSpline ): SplineBorderView {

		const border = new SplineBorderView( spline );

		if ( spline.getControlPointCount() < 2 ) return;

		const add = ( points: AbstractControlPoint[] ) => {
			if ( points.length < 2 ) return;
			const positions = points.map( point => point.position );
			return DebugLine.create( positions );
		};

		border.leftBorder = add( spline.leftPoints );
		border.rightBorder = add( spline.rightPoints );

		border.add( border.leftBorder );
		border.add( border.rightBorder );

		return border;
	}
}
