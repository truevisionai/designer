/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from "app/events/event-emitter";
import { Points, BufferGeometry, PointsMaterial, Vector3, Float32BufferAttribute, ColorRepresentation } from "three";
import { IView } from "./i-view";
import { OdTextures } from "app/deprecated/od.textures";
import { ColorUtils } from "app/views/shared/utils/colors.service";
import { IViewModel } from "./i-view-model";
import { ViewManager } from 'app/tools/point-marking/view-manager';


export class PointView extends Points implements IView {

	isView: boolean = true;

	private events = new EventEmitter<this>();

	private viewModel: IViewModel<any, any>;

	private constructor ( public geometry: BufferGeometry, public material: PointsMaterial ) {
		super( geometry, material );
	}

	show (): void {
		this.visible = true;
		ViewManager.addViewModel( this.viewModel );
	}

	hide (): void {
		this.visible = false;
		ViewManager.remove( this.viewModel );
	}

	update (): void {
		this.events.emit( 'update', this );
	}

	remove ( ...objects ): this {
		ViewManager.remove( this.viewModel );
		return this;
	}

	onMouseOver?(): void {
		this.events.emit( 'mouseOver', this );
	}

	onMouseOut?(): void {
		this.events.emit( 'mouseOut', this );
	}

	onClick?(): void {
		this.events.emit( 'click', this );
	}

	on ( event: string, callback: ( object: IView ) => void ): void {
		this.events.on( event, callback );
	}

	emit ( event: string, data: any ): void {
		this.events.emit( event, data );
	}

	bindViewModel ( viewModel: IViewModel<any, any> ): void {
		this.viewModel = viewModel;
	}

	getViewModel (): IViewModel<any, any> {
		return this.viewModel;
	}

	setColor ( color: ColorRepresentation ): void {
		this.material.color.set( color );
		this.material.needsUpdate = true;
	}

	getPosition (): Vector3 {
		return this.position;
	}

	setPosition ( position: Vector3 ): void {
		this.position.copy( position );
		this.updateMatrixWorld( true );
	}

	static create ( position: Vector3 ): PointView {

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );

		// const geometry = new BufferGeometry();
		// geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const material = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: ColorUtils.CYAN,
			depthTest: false
		} );

		const point = new PointView( geometry, material );

		point.renderOrder = 3;

		point.position.copy( position );

		return point;
	}

}
