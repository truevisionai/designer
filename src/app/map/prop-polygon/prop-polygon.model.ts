/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvTransform } from '../models/tv-transform';
import { MathUtils } from 'three';
import { PropPoint } from "../prop-point/prop-point.model";

export class PropPolygon {

	public static index = 0;

	public static tag: string = 'prop-polygon';

	public id: string;

	public props: PropPoint[] = [];

	public spline: CatmullRomSpline

	constructor ( public propGuid: string, spline?: CatmullRomSpline, public density = 0.5 ) {

		this.spline = spline || new CatmullRomSpline( true, 'catmullrom', 0.001 );

		this.id = MathUtils.generateUUID();

	}

	update (): void {

		this.spline.update();

	}

	addControlPoint ( cp: AbstractControlPoint ) {

		this.spline.add( cp );

	}

	removeControlPoint ( point: AbstractControlPoint ) {

		this.spline.removeControlPoint( point );

		this.update();

	}

	hideControlPoints () {

		this.spline.hidecontrolPoints();

	}

	showControlPoints () {

		this.spline.showcontrolPoints();

	}

	addTransform ( guid: string, transform: TvTransform ) {

		this.props.push( { guid, transform } );

	}

}

