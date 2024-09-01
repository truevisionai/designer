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
import { Log } from 'app/core/utils/log';

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

		if ( position ) this.position.copy( position );

		this.name = 'road-control-point';

		this.userData.is_button = true;
		this.userData.is_control_point = true;
		this.userData.is_selectable = true;

		this.tag = 'cp';
		this.tagindex = tagindex;

		this.renderOrder = 3;

	}

	get spline () {
		return this.road.spline;
	}

	copyPosition ( position: Vector3 ) {

		if ( !this.allowChange ) return;

		super.copyPosition( position );

		this.update();

	}

	setPosition ( position: Vector3 ): void {

		if ( !this.allowChange ) return;

		super.setPosition( position );

		this.update();

	}

	update () {

		// NOTE: we need to ensure if position is update th
		this.segmentType = TvGeometryType.SPIRAL;

		this.updateFrontTangent();

		this.updateBackTangent();

		this.updateTangentLineGeometry();

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

		this.tangentLineGeometry = new BufferGeometry().setFromPoints( [ this.frontTangent.position, this.backTangent.position ] );

		this.tangentLine = new Line( this.tangentLineGeometry, this.tangentLineMaterial );

		this.tangentLine.name = 'tangent-control-line';

		this.tangentLine.castShadow = true;

		this.tangentLine.renderOrder = 3;

		this.tangentLine.frustumCulled = false;

	}

	private updateTangentLineGeometry (): void {

		if ( !this.frontTangent || !this.backTangent ) {
			Log.error( 'Front or back tangent not found' );
			return;
		}

		if ( !this.tangentLine ) {
			Log.error( 'Tangent line not found' );
			return;
		}

		const buffer = this.tangentLineGeometry.attributes.position as BufferAttribute;

		buffer.setXYZ( 0, this.frontTangent.position.x, this.frontTangent.position.y, this.frontTangent.position.z );

		buffer.setXYZ( 1, this.backTangent.position.x, this.backTangent.position.y, this.backTangent.position.z );

		buffer.needsUpdate = true;

	}

	private updateFrontTangent (): void {

		this.updateTangent( this.frontTangent, 'front' );

	}

	private updateBackTangent (): void {

		this.updateTangent( this.backTangent, 'back' );

	}

	private updateTangent ( tangentPoint: RoadTangentPoint, location: 'front' | 'back' ): void {

		if ( !tangentPoint ) {
			Log.error( 'Tangent not found', location );
			return;
		}

		const sign = location === 'front' ? 1 : -1;

		const position = new Vector3( Math.cos( this.hdg ), Math.sin( this.hdg ), CURVE_Y )
			.multiplyScalar( tangentPoint.length * sign )
			.add( this.position );

		tangentPoint.copyPosition( position );

		tangentPoint?.updateTangents();
	}
}
