/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CURVE_Y } from 'app/core/shapes/spline-config';
import { TvRoad } from 'app/map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from 'three';
import { IHasUpdate } from '../../commands/set-value-command';
import { RoadControlPoint } from './road-control-point';
import { AbstractControlPoint } from "../abstract-control-point";
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

export abstract class RoadTangentPoint extends AbstractControlPoint implements IHasUpdate {

	public static readonly tag = 'RoadTangentPoint';

	protected defaultColor = COLOR.MBLUE;

	public length = 1;

	abstract update (): void;

	abstract getHeading (): number;

	constructor ( public road: TvRoad, index: number, public controlPoint: RoadControlPoint ) {

		super( new BufferGeometry(), new PointsMaterial() );

		this.init();

		this.userData.is_button = true;

		this.userData.is_control_point = true;

		this.userData.is_selectable = true;

		this.tag = RoadTangentPoint.tag;

		this.index = index;

	}

	get spline (): AbstractSpline {

		return this.road.spline;

	}

	init (): void {

		this.geometry = new BufferGeometry();

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		this.material = this.getDefaultMaterial();

	}

	setPosition ( position: Vector3 ): void {

		super.setPosition( position );

		this.update();

	}

}

export class FrontTangentPoint extends RoadTangentPoint {

	constructor ( road: TvRoad, index: number, controlPoint: RoadControlPoint ) {
		super( road, index, controlPoint );
	}

	update (): void {

		const delta = new Vector3().subVectors(
			this.position,
			this.controlPoint.position
		);

		this.controlPoint.hdg = this.getHeading();

		this.length = delta.length();

		this.position.set(
			Math.cos( this.controlPoint.hdg ),
			Math.sin( this.controlPoint.hdg ),
			CURVE_Y
		).multiplyScalar( this.length )
			.add( this.controlPoint.position );
	}

	getHeading (): number {

		const delta = new Vector3().subVectors(
			this.position,
			this.controlPoint.position
		);

		return Math.atan2( delta.y, delta.x );

	}

}

export class BackTangentPoint extends RoadTangentPoint {

	constructor ( road: TvRoad, index: number, controlPoint: RoadControlPoint ) {
		super( road, index, controlPoint );
	}

	update (): void {

		const delta = new Vector3().subVectors(
			this.position,
			this.controlPoint.position
		);

		this.controlPoint.hdg = Math.PI + Math.atan2( delta.y, delta.x );

		this.length = delta.length();

		this.position.set(
			Math.cos( this.controlPoint.hdg ),
			Math.sin( this.controlPoint.hdg ),
			CURVE_Y
		).multiplyScalar( -this.length )
			.add( this.controlPoint.position );

	}

	getHeading (): number {

		const delta = new Vector3().subVectors(
			this.position,
			this.controlPoint.position
		);

		return Math.PI + Math.atan2( delta.y, delta.x );

	}

}
