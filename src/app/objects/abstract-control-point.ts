/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Color, Material, Points, PointsMaterial, Vector3 } from "three";
import { ISelectable } from "./i-selectable";
import { IHasPosition } from "./i-has-position";
import { COLOR } from "../views/shared/utils/colors.service";
import { OdTextures } from "app/deprecated/od.textures";

export abstract class AbstractControlPoint extends Points implements ISelectable, IHasPosition {

	protected defaultColor = COLOR.CYAN;

	protected hoverColor = COLOR.YELLOW;

	protected selectedColor = COLOR.RED;

	public mainObject: any;

	public tag: string;

	public index: number;

	public isSelected: boolean;

	protected _hdg: number = 0;

	get target (): any {
		return this.mainObject;
	}

	constructor ( geometry: BufferGeometry, public material: PointsMaterial ) {

		super( geometry, material );

		this.renderOrder = 3;

		this.layers.enable( 31 );

		this.tag = 'control-point';

	}

	get hdg (): number {
		return this._hdg;
	}

	set hdg ( value: number ) {
		if ( this.shouldUpdateHeading() ) {
			this._hdg = value;
		}
	}

	setPosition ( position: Vector3 ): void {

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

	update (): void {

		// do nothing

	}

	onMouseOver (): void {

		this.material.color = new Color( this.hoverColor );
		this.material.needsUpdate = true;

	}

	onMouseOut (): void {

		this.material.color = new Color( this.defaultColor );
		this.material.needsUpdate = true;

	}

	select (): void {

		this.isSelected = true;

		this.material.color = new Color( this.selectedColor );
		this.material.needsUpdate = true;

	}

	unselect (): void {

		this.isSelected = false;

		this.material.color = new Color( this.defaultColor );
		this.material.needsUpdate = true;

	}

	getForwardPosition ( distance: number, hdg?: number ): Vector3 {

		const theta = hdg || this[ 'hdg' ];

		const x = this.position.x + distance * Math.cos( theta );
		const y = this.position.y + distance * Math.sin( theta );

		return new Vector3( x, y, this.position.z );

	}

	getDirectionVector (): Vector3 {

		return new Vector3( Math.cos( this[ 'hdg' ] ), Math.sin( this[ 'hdg' ] ), 0 );

	}

	getHeading (): number {

		return this[ 'hdg' ];

	}

	protected getDefaultMaterial (): PointsMaterial {

		return new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: this.defaultColor,
			depthTest: false
		} );
	}

	protected static getDefaultMaterial (): PointsMaterial {

		return new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

	}

	shouldUpdateHeading (): boolean {

		return true;

	}

}
