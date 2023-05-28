/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropInstance } from 'app/core/models/prop-instance.model';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { AssetDatabase } from 'app/services/asset-database';
import { Maths } from 'app/utils/maths';
import { Object3D } from 'three';
import { TvMapInstance } from '../services/tv-map-source-file';

export class PropCurve {

	public reverse: boolean = false;

	public spacing: number = 5.0;

	public rotation: number = 0.0;

	public positionVariance: number = 0.0;

	public props: Object3D[] = [];

	constructor ( public propGuid: string, public spline?: CatmullRomSpline, public headings: number[] = [] ) {

		if ( !this.spline ) {

			this.spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

			this.spline.init();

		}

	}

	update () {

		this.spline.update();

		this.updateProps();

	}

	updateProps () {

		if ( this.spline.controlPoints.length < 2 ) return;

		const length = ( this.spline as CatmullRomSpline ).getLength();

		if ( length <= 0 ) return;

		this.props.forEach( prop => TvMapInstance.map.gameObject.remove( prop ) );

		this.props.splice( 0, this.props.length );

		const spline = this.spline as CatmullRomSpline;

		const instance = AssetDatabase.getInstance( this.propGuid ) as Object3D;

		for ( let i = 0; i < length; i += this.spacing ) {

			const t = spline.curve.getUtoTmapping( 0, i );

			const position = spline.curve.getPoint( t );

			const prop = instance.clone();

			// apply random position variance
			position.setX( position.x + Maths.randomFloatBetween( -this.positionVariance, this.positionVariance ) );
			position.setY( position.y + Maths.randomFloatBetween( -this.positionVariance, this.positionVariance ) );

			// apply random rotation variance
			prop.rotateX( Maths.randomFloatBetween( -this.rotation, this.rotation ) );
			prop.rotateY( Maths.randomFloatBetween( -this.rotation, this.rotation ) );
			prop.rotateZ( Maths.randomFloatBetween( -this.rotation, this.rotation ) );

			prop.position.copy( position );

			this.props.push( prop );

			TvMapInstance.map.gameObject.add( prop );

		}

	}

	addControlPoint ( cp: AnyControlPoint ) {

		( this.spline as CatmullRomSpline ).add( cp );

		this.update();
	}

	bake () {

		this.props.forEach( object => {

			const prop = new PropInstance( this.propGuid, object );

			object.position.copy( object.position );

			prop.point = AnyControlPoint.create( prop.guid, object.position );

			prop.point.mainObject = prop;

			TvMapInstance.map.props.push( prop );

		} );

	}

	delete () {

		this.props.splice( 0, this.props.length );

		this.spline.hide();

	}
}
