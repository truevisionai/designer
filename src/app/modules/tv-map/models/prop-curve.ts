/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropInstance } from 'app/core/models/prop-instance.model';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { Maths } from 'app/utils/maths';
import { Object3D, Vector3 } from 'three';
import { TvMapInstance } from '../services/tv-map-source-file';
import { AbstractShapeEditor } from 'app/core/editors/abstract-shape-editor';
import { SerializedField } from 'app/core/components/serialization';

export class PropCurve {

	public static tag = 'propCurve';

	public reverse: boolean = false;

	private _spacing: number = 5.0;

	private _rotation: number = 0.0;

	private _positionVariance: number = 0.0;

	public props: Object3D[] = [];

	constructor ( public propGuid: string, public spline?: CatmullRomSpline, public headings: number[] = [] ) {

		if ( !this.spline ) {

			this.spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

			this.spline.mesh.userData[ PropCurve.tag ] = this;

			this.spline.mesh[ 'tag' ] = PropCurve.tag;

		}

	}

	@SerializedField( { type: 'float', min: 0, max: 100 } )
	get spacing (): number {
		return this._spacing;
	}

	set spacing ( value: number ) {
		this._spacing = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get rotation (): number {
		return this._rotation;
	}

	set rotation ( value: number ) {
		this._rotation = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 100 } )
	get positionVariance (): number {
		return this._positionVariance;
	}

	set positionVariance ( value: number ) {
		this._positionVariance = value;
		this.update();
	}

	show ( shapeEditor?: AbstractShapeEditor ): void {

		this.spline.show();

		if ( !shapeEditor ) return;

		this.spline.controlPoints.forEach( point => {

			shapeEditor?.controlPoints.push( point );

		} );
	}

	hide () {

		this.spline.hide();
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

			const point = spline.curve.getPoint( t );

			const prop = instance.clone();

			// apply random position variance
			const position = new Vector3(
				point.x + Maths.randomFloatBetween( -this.positionVariance, this.positionVariance ),
				point.y + Maths.randomFloatBetween( -this.positionVariance, this.positionVariance ),
				point.z + 0,
			);

			// apply random rotation variance
			const rotation = new Vector3(
				prop.rotation.x + Maths.randomFloatBetween( -this.rotation, this.rotation ),
				prop.rotation.y + Maths.randomFloatBetween( -this.rotation, this.rotation ),
				prop.rotation.z + Maths.randomFloatBetween( -this.rotation, this.rotation ),
			);

			this.addProp( prop, position, rotation, prop.scale );

			this.props.push( prop );

		}

	}

	addProp ( prop: Object3D, position: Vector3, rotation: Vector3, scale: Vector3 ) {

		prop.position.copy( position );

		prop.rotation.setFromVector3( rotation );

		prop.scale.copy( scale );

		this.props.push( prop );

		TvMapInstance.map.gameObject.add( prop );

	}

	addControlPoint ( cp: AnyControlPoint ) {

		( this.spline as CatmullRomSpline ).add( cp );

		this.update();
	}

	bake () {

		// not used currently

		this.props.forEach( object => {

			const prop = new PropInstance( this.propGuid, object );

			object.position.copy( object.position );

			prop.point = AnyControlPoint.create( prop.guid, object.position );

			prop.point.mainObject = prop;

			TvMapInstance.map.props.push( prop );

		} );

	}

	delete () {

		this.props.forEach( prop => TvMapInstance.map.gameObject.remove( prop ) );

		this.props.forEach( prop => SceneService.remove( prop ) );

		this.props.splice( 0, this.props.length );

		SceneService.remove( this.spline.mesh );

		this.spline.controlPoints.forEach( cp => {

			this.spline.removeControlPoint( cp );

		} );

		this.spline.hide();

	}

	removeControlPoint ( point: BaseControlPoint ) {

		const index = this.spline.controlPoints.indexOf( point );

		if ( index > -1 ) {

			this.spline.removeControlPoint( point );

		}

		this.update();

	}

}
