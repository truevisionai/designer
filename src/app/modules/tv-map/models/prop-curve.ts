/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { Object3D, Vector3 } from 'three';
import { AnyControlPoint } from "../../three-js/objects/any-control-point";

export class PropCurve {

	public static tag = 'propCurve';

	public props: Object3D[] = [];

	constructor (
		public propGuid: string,
		public spline?: CatmullRomSpline,
		public spacing: number = 5.0,
		public rotation: number = 0.0,
		public positionVariance: number = 0.0,
		public reverse = false,
	) {

		if ( !this.spline ) {

			this.spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

			this.spline.mesh.userData[ PropCurve.tag ] = this;

			this.spline.mesh[ 'tag' ] = PropCurve.tag;

		}

	}

	update () {

		this.spline.update();

	}

	addProp ( prop: Object3D, position: Vector3, rotation: Vector3, scale: Vector3 ) {

		prop.position.copy( position );

		prop.rotation.setFromVector3( rotation );

		prop.scale.copy( scale );

		this.props.push( prop );

	}

	addControlPoint ( cp: AnyControlPoint ) {

		( this.spline as CatmullRomSpline ).add( cp );

		this.update();
	}

}
