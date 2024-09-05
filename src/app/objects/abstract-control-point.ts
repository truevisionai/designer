/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Color, Material, Points, PointsMaterial, Vector3 } from "three";
import { ISelectable } from "./i-selectable";
import { IHasPosition } from "./i-has-position";
import { COLOR } from "../views/shared/utils/colors.service";

const DEFAULT_COLOR = COLOR.CYAN;
const HOVERED_COLOR = COLOR.YELLOW;
const SELECTED_COLOR = COLOR.RED;

export abstract class AbstractControlPoint extends Points implements ISelectable, IHasPosition {

	public mainObject: any;

	public tag: string;
	public tagindex: number;

	public isSelected: boolean;

	get target (): any {
		return this.mainObject;
	}

	constructor ( geometry?: BufferGeometry, material?: Material | Material[] ) {

		super( geometry, material );

		this.renderOrder = 3;

		this.layers.enable( 31 );

		this.tag = 'control-point';

	}

	setPosition ( position: Vector3 ) {

		this.position.copy( position.clone() );

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

	update (): void { }

	onMouseOver () {

		( this.material as PointsMaterial ).color = new Color( HOVERED_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	onMouseOut () {

		( this.material as PointsMaterial ).color = new Color( DEFAULT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	select () {

		this.isSelected = true;

		( this.material as PointsMaterial ).color = new Color( SELECTED_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		( this.material as PointsMaterial ).color = new Color( DEFAULT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	getForwardPosition ( distance: number, hdg?: number ) {

		const theta = hdg || this[ 'hdg' ];

		const x = this.position.x + distance * Math.cos( theta );
		const y = this.position.y + distance * Math.sin( theta );

		return new Vector3( x, y, this.position.z );

		// this.setPosition( newPoint );

		// return newPoint;

	}

	getDirectionVector () {

		return new Vector3( Math.cos( this[ 'hdg' ] ), Math.sin( this[ 'hdg' ] ), 0 );

	}

}
