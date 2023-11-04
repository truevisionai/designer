/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Color, Material, Points, PointsMaterial, Vector3 } from 'three';
import { IHasPosition } from './i-has-position';
import { ISelectable } from './i-selectable';

export abstract class BaseControlPoint extends Points implements ISelectable, IHasPosition {

	public mainObject: any;

	public tag: string;
	public tagindex: number;

	public updated = new EventEmitter<BaseControlPoint>();
	public isSelected: boolean;
	protected DEFAULT_CONTROL_POINT_COLOR = COLOR.CYAN;
	protected HOVERED_CONTROL_POINT_COLOR = COLOR.YELLOW;
	protected SELECTED_CONTROL_POINT_COLOR = COLOR.RED;

	constructor ( geometry?: BufferGeometry, material?: Material | Material[] ) {

		super( geometry, material );

		this.renderOrder = 3;

		this.layers.enable( 31 );
	}

	setPosition ( position: Vector3 ) {

		this.position.copy( position );

		this.updated.emit( this );
	}

	copyPosition ( position: Vector3 ) {

		this.setPosition( position.clone() );

	}

	getPosition (): Vector3 {

		return this.position;

	}

	show (): void {

		this.visible = true;

	}

	hide (): void {

		this.visible = false;

	}

	onMouseOver () {

		( this.material as PointsMaterial ).color = new Color( this.HOVERED_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	onMouseOut () {

		( this.material as PointsMaterial ).color = new Color( this.DEFAULT_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	select () {

		this.isSelected = true;

		( this.material as PointsMaterial ).color = new Color( this.SELECTED_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		( this.material as PointsMaterial ).color = new Color( this.DEFAULT_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

}

export class DistanceNode extends BaseControlPoint {

	constructor ( public s: number, geometry?: BufferGeometry, material?: Material ) {
		super( geometry, material );
	}

}

export class NewDistanceNode extends BaseControlPoint {

	constructor ( public roadId, public laneId, public s: number, public t: number, geometry?: BufferGeometry, material?: Material ) {
		super( geometry, material );
	}

}


/**
 * @deprecated avoid using this use BaseControlPoint or use an exact implementation
 */
export class AnyControlPoint extends BaseControlPoint {

	static roadTag = 'road';

	static create ( name = '', position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const dotMaterial = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		const cp = new AnyControlPoint( dotGeometry, dotMaterial );

		if ( position ) cp.copyPosition( position );

		cp.userData.is_button = true;
		cp.userData.is_control_point = true;
		cp.userData.is_selectable = true;

		cp.tag = this.roadTag;

		cp.renderOrder = 3;

		return cp;
	}

}

