/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { TvTransform } from '../models/tv-transform';
import { MathUtils, Vector3 } from "three";
import { PropPoint } from "../prop-point/prop-point.model";
import { PropPolygonPoint } from 'app/modules/prop-polygon/objects/prop-polygon-point';

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

	addTransform ( guid: string, transform: TvTransform ): void {

		this.props.push( { guid, transform } );

	}

	addPointAt ( position: Vector3, index: number ): void {

		const point = new PropPolygonPoint( this );

		point.position.copy( position );

		point.index = index;

		this.spline.addControlPoint( point );

	}


}

