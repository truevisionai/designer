/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { Object3D, Vector3 } from "three";
import { AbstractSpline } from "../../core/shapes/abstract-spline";

export class PropCurve {

	public static tag = 'propCurve';

	public props: Object3D[] = [];

	constructor (
		public propGuid: string,
		public spline?: AbstractSpline,
		public spacing: number = 5.0,
		public rotation: number = 0.0,
		public positionVariance: number = 0.0,
		public reverse = false,
	) {

		if ( !this.spline ) {

			this.spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

		}

	}

	getSpline (): AbstractSpline {
		return this.spline;
	}

	setSpline ( spline: AbstractSpline ): void {
		this.spline = spline;
	}

	addProp ( prop: Object3D, position: Vector3, rotation: Vector3, scale: Vector3 ): void {

		prop.position.copy( position );

		prop.rotation.setFromVector3( rotation );

		prop.scale.copy( scale );

		this.props.push( prop );

	}

}
