/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CURVE_Y } from 'app/core/shapes/spline-config';
import { OdTextures } from 'app/deprecated/od.textures';
import { TvContactPoint, TvGeometryType } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from 'three';
import { IHasUpdate } from '../../commands/set-value-command';
import { RoadControlPoint } from './road-control-point';
import { AbstractControlPoint } from "../abstract-control-point";
import { SplineType } from 'app/core/shapes/abstract-spline';

export class RoadTangentPoint extends AbstractControlPoint implements IHasUpdate {

	// public static readonly tag = 'road-tangent-point';

	public length = 1;

	// tag, tagindex, cpobjidx are not used anywhere in new fixed workflow
	constructor (
		public road: TvRoad,
		position: Vector3,
		public tag: 'tpf' | 'tpb',
		public tagindex: number,
		public cpobjidx: number,
		public controlPoint: RoadControlPoint
	) {

		super( new BufferGeometry(), new PointsMaterial() );

		this.geometry = new BufferGeometry();

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		this.material = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.GREEN,
			depthTest: false
		} );

		if ( position ) this.position.copy( position.clone() );

		this.userData.is_button = true;
		this.userData.is_control_point = true;
		this.userData.is_selectable = true;

		this.tag = tag;

		this.tagindex = tagindex;

		this.renderOrder = 3;

		this.layers.enable( 31 );
	}

	get spline () {
		return this.road.spline;
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

	update (): void {

		this.updateTangents();

		this.updateSuccessor();

		this.updatePredecessor();

	}

	updateTangents () {

		if ( this.tag === 'tpf' && this.controlPoint.frontTangent ) {

			const delta = new Vector3().subVectors(
				this.controlPoint.frontTangent.position,
				this.controlPoint.position
			);

			this.controlPoint.hdg = Math.atan2( delta.y, delta.x );

			this.length = delta.length();

		} else if ( this.tag === 'tpb' && this.controlPoint.backTangent ) {

			const delta = new Vector3().subVectors(
				this.controlPoint.backTangent.position,
				this.controlPoint.position
			);

			this.controlPoint.hdg = Math.PI + Math.atan2( delta.y, delta.x );

			this.length = delta.length();

		}

		if ( this.controlPoint.frontTangent ) {

			this.controlPoint.frontTangent.position.set(
				Math.cos( this.controlPoint.hdg ),
				Math.sin( this.controlPoint.hdg ),
				CURVE_Y
			).multiplyScalar( this.controlPoint.frontTangent.length )
				.add( this.controlPoint.position );

		}

		if ( this.controlPoint.backTangent ) {

			this.controlPoint.backTangent.position.set(
				Math.cos( this.controlPoint.hdg ),
				Math.sin( this.controlPoint.hdg ),
				CURVE_Y
			).multiplyScalar( -this.controlPoint.backTangent.length )
				.add( this.controlPoint.position );

		}

	}

	copyPosition ( position: Vector3 ) {

		super.copyPosition( position );

		this.controlPoint.segmentType = TvGeometryType.SPIRAL;

		if ( this.road.spline.type === SplineType.EXPLICIT ) {

			this.markAsSpiral( this.road.spline.controlPoints, this );

		}

		this.update();

	}

	markAsSpiral ( controlPoints: AbstractControlPoint[], point: AbstractControlPoint ) {

		const idx = point.tagindex;

		if ( idx > 0 ) {

			const previousPoint = controlPoints[ idx - 1 ] as RoadControlPoint;
			const currentPoint = controlPoints[ idx ] as RoadControlPoint;

			// need to set previous point to spiral to avoid bugs
			previousPoint.segmentType = TvGeometryType.SPIRAL;
			currentPoint.segmentType = TvGeometryType.SPIRAL;

			// FOR NOW: hdg changes are not needed those are handled in update function

			// const dir1 = new Vector2( Math.cos( this.hdgs[ idx - 1 ][ 0 ] ), Math.sin( this.hdgs[ idx - 1 ][ 0 ] ) );
			// const dir2 = new Vector2( Math.cos( this.hdgs[ idx ][ 0 ] ), Math.sin( this.hdgs[ idx ][ 0 ] ) );

			// const sd = SPIRAL.vec2Angle( dir1.x, dir1.y );
			// const ed = SPIRAL.vec2Angle( dir2.x, dir2.y );

		}

	}

	private updatePredecessor () {

		if ( this.road.isJunction ) return;

		if ( !this.shouldUpdatePredecessor ) return;

		//this.road.predecessor?.update( this.road, TvContactPoint.START );

	}

	private updateSuccessor () {

		if ( this.road.isJunction ) return;

		if ( !this.shouldUpdateSuccessor ) return;

		//this.road.successor?.update( this.road, TvContactPoint.END );
	}

}
