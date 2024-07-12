/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CURVE_Y } from 'app/core/shapes/spline-config';
import { OdTextures } from 'app/deprecated/od.textures';
import { TvGeometryType } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, PointsMaterial, Vector3 } from 'three';
import { RoadTangentPoint } from './road-tangent-point';
import { AbstractControlPoint } from "./abstract-control-point";
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';

/**
 * @deprecated
 */
export class RoadControlPoint extends AbstractControlPoint {

	public static readonly tag = 'road-control-point';

	public mainObject: TvRoad;

	public frontTangent: RoadTangentPoint;

	public backTangent: RoadTangentPoint;

	public tangentLine: Line;

	public tangentLineGeometry: BufferGeometry;

	public tangentLineMaterial = new LineBasicMaterial( {
		color: COLOR.CYAN,
		linewidth: 2
	} );

	public hdg: number;

	public segmentType: TvGeometryType;

	public segmentGeometry: TvAbstractRoadGeometry;

	public allowChange: boolean = true;

	// tag, tagindex, cpobjidx are not used anywhere in new fixed workflow
	// can add hdg here and
	// remove segmentType from here to spline directly
	constructor ( public road: TvRoad, position: Vector3, tagindex?: number ) {

		super( new BufferGeometry(), new PointsMaterial() );

		this.mainObject = road;

		this.geometry = new BufferGeometry();

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		this.material = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		if ( position ) this.initPosition( position );

		this.name = 'road-control-point';

		this.userData.is_button = true;
		this.userData.is_control_point = true;
		this.userData.is_selectable = true;

		this.tag = 'cp';
		this.tagindex = tagindex;

		this.renderOrder = 3;

	}

	get spline () {
		return this.road?.spline;
	}

	private get index () {
		return this.road.spline?.controlPoints.indexOf( this );
	}

	private get shouldUpdatePredecessor () {
		return this.index === 0 || this.index === 1;
	}

	private get shouldUpdateSuccessor () {
		const controlPoints = this.road.spline.controlPoints;
		return this.index === controlPoints.length - 1 || this.index === controlPoints.length - 2;
	}

	copyPosition ( position: Vector3 ) {

		if ( !this.allowChange ) return;

		super.copyPosition( position );

		// NOTE: we need to ensure if position is update th
		this.segmentType = TvGeometryType.SPIRAL;

	}

	setPosition ( position: Vector3 ): void {

		if ( !this.allowChange ) return;

		super.setPosition( position );

		// NOTE: we need to ensure if position is update th
		this.segmentType = TvGeometryType.SPIRAL;

	}

	update () {

		// NOTE: we need to ensure if position is update th
		this.segmentType = TvGeometryType.SPIRAL;

	}

	show () {

		super.show();

		if ( this.frontTangent ) this.frontTangent.show();

		if ( this.backTangent ) this.backTangent.show();

		if ( this.tangentLine ) this.tangentLine.visible = true;
	}

	hide () {

		super.hide();

		if ( this.frontTangent ) this.frontTangent.hide();

		if ( this.backTangent ) this.backTangent.hide();

		if ( this.tangentLine ) this.tangentLine.visible = false;

	}

	addDefaultTangents ( hdg: number, frontLength: number, backLength: number ) {

		const frontPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
			.multiplyScalar( frontLength )
			.add( this.position );

		const backPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
			.multiplyScalar( -backLength )
			.add( this.position );

		this.frontTangent = new RoadTangentPoint(
			this.road,
			frontPosition,
			'tpf',
			this.tagindex,
			this.tagindex + 1 + this.tagindex * 2,
			this,
		);

		this.backTangent = new RoadTangentPoint(
			this.road,
			backPosition,
			'tpb',
			this.tagindex,
			this.tagindex + 1 + this.tagindex * 2 + 1,
			this,
		);

		// TODO: move this maybe somewhere else

		// SceneService.addToMain( this.frontTangent );

		// SceneService.addToMain( this.backTangent );

		this.tangentLineGeometry = new BufferGeometry().setFromPoints( [ this.frontTangent.position, this.backTangent.position ] );

		this.tangentLine = new Line( this.tangentLineGeometry, this.tangentLineMaterial );

		this.tangentLine.name = 'tangent-control-line';

		this.tangentLine.castShadow = true;

		this.tangentLine.renderOrder = 3;

		this.tangentLine.frustumCulled = false;

		// SceneService.addToMain( this.tangentLine );
	}

	// removeTangents () {
	//
	// 	SceneService.removeFromMain( this.frontTangent );
	//
	// 	SceneService.removeFromMain( this.backTangent );
	//
	// 	SceneService.removeFromMain( this.tangentLine );
	//
	// }
	//
	// moveForward ( s: number ): RoadControlPoint {
	//
	// 	const x = this.position.x + Math.cos( this.hdg ) * s;
	// 	const y = this.position.y + Math.sin( this.hdg ) * s;
	//
	// 	return new RoadControlPoint( this.road, new Vector3( x, y, 0 ), this.tag, this.tagindex, this.tagindex );
	// }

	private initPosition ( position: Vector3 ) {

		if ( !this.allowChange ) return;

		super.copyPosition( position );

	}

}
