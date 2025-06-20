/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Line2 } from "three/examples/jsm/lines/Line2";
import { IView } from "./i-view";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Color, ColorRepresentation, Vector2, Vector3 } from "three";
import { ColorUtils } from "../../../views/shared/utils/colors.service";
import { EventEmitter } from "../../../events/event-emitter";
import { IViewModel } from "./i-view-model";

export class LineView extends Line2 implements IView {

	public isView: boolean = true;

	public events = new EventEmitter<this>();

	private originalWidth: number;

	private viewModel: IViewModel<any, any>;

	constructor ( geometry: LineGeometry, material: LineMaterial, private points: Vector3[] ) {

		super( geometry, material );

		this.originalWidth = material?.linewidth || 2;

	}

	static create ( points: Vector3[], width: number = 5, color: any = ColorUtils.CYAN ): LineView {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = this.getMaterial( color, width );

		return new LineView( geometry, material, points );

	}

	static getMaterial ( color: any = ColorUtils.CYAN, width: number = 2 ): LineMaterial {

		return new LineMaterial( {
			color: color,
			linewidth: width,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

	}

	show (): void {
		this.visible = true;
	}

	hide (): void {
		this.visible = false;
	}

	update (): void {
		this.geometry.dispose();
		this.geometry = new LineGeometry().setPositions( this.points.flatMap( p => [ p.x, p.y, p.z ] ) );
	}

	onMouseOver? (): void {
		this.events.emit( 'mouseOver', this );
	}

	onMouseOut? (): void {
		this.events.emit( 'mouseOut', this );
	}

	onClick? (): void {
		this.events.emit( 'clicked', this );
	}

	onUnselect (): void {
		this.events.emit( 'unselected', this );
	}

	onDeselect? (): void {
		this.events.emit( 'deselected', this );
	}

	addPoint ( position: Vector3 ): void {
		this.points.push( position );
		this.update();
	}

	setColor ( color: ColorRepresentation ): void {
		this.material.color = new Color( color );
		this.material.needsUpdate = true;
	}

	on ( event: string, callback: ( object: IView ) => void ): void {
		this.events.on( event, callback );
	}

	emit ( event: string, object: IView ): void {
		this.events.emit( event, this );
	}

	bindViewModel ( viewModel: IViewModel<any, any> ): void {
		this.viewModel = viewModel;
	}

	getViewModel (): IViewModel<any, any> {
		return this.viewModel as any;
	}

	getPosition (): Vector3 {
		return this.position;
	}

	setPosition ( position: Vector3 ): void {
		this.position.copy( position );
		this.updateMatrixWorld( true );
	}
}
