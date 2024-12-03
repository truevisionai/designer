/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { CameraService } from 'app/renderer/camera.service';
import { CanvasService } from 'app/renderer/canvas.service';
import { Vector2, Vector3 } from 'three';

export interface TooltipInterface {
	id: number;
	content: string;
	position: Vector2;
}

@Injectable( {
	providedIn: 'root'
} )
export class ToolTipService {

	static instance: ToolTipService;

	public tooltipAdded = new EventEmitter<TooltipInterface>();
	public tooltipUpdated = new EventEmitter<TooltipInterface>();
	public tooltipRemoved = new EventEmitter<TooltipInterface>();

	private tooltips = new Map<number, TooltipInterface>();

	private lastTooltip: TooltipInterface;

	constructor (
		private canvasService: CanvasService,
		private cameraService: CameraService
	) {
		ToolTipService.instance = this;
	}

	createFrom3D ( text: string, position: Vector2 | Vector3 ): any {

		const id = this.tooltips.size + 1;

		const position2D = position instanceof Vector2 ? position : this.get2DPosition( position );

		return this.createTooltip( id, text, position2D );

	}

	createOrUpdate ( text: string, position: Vector2 | Vector3 ): void {

		if ( !this.lastTooltip ) {

			this.lastTooltip = this.createFrom3D( text, position );

		} else {

			this.updateTooltipContent( this.lastTooltip.id, text );

			this.updateTooltipPosition( this.lastTooltip.id, position );

		}

	}

	removeLastTooltip (): void {

		if ( this.lastTooltip ) {
			this.removeToolTip( this.lastTooltip );
		}

		this.lastTooltip = null;

	}

	private createTooltip ( id: number, content: string, position: Vector2 ): any {

		const toolTip = { id, content, position };

		this.tooltips.set( id, toolTip );

		this.tooltipAdded.emit( toolTip );

		return toolTip;
	}

	updateTooltipPosition ( id: number, position: Vector2 | Vector3 ): void {

		if ( this.tooltips.has( id ) ) {

			const tooltip = this.tooltips.get( id );

			if ( position instanceof Vector3 ) {

				tooltip.position = this.get2DPosition( position );

			} else {

				tooltip.position = position;

			}

			this.tooltipUpdated.emit( tooltip );

		}

	}

	updateTooltipContent ( id: number, content: string ): void {

		if ( this.tooltips.has( id ) ) {

			const tooltip = this.tooltips.get( id );

			tooltip.content = content;

			this.tooltipUpdated.emit( tooltip );

		}

	}

	removeToolTip ( toolTip: TooltipInterface ): void {

		if ( this.tooltips.has( toolTip.id ) ) {

			this.tooltips.delete( toolTip.id );

			this.tooltipRemoved.emit( toolTip );

		}

	}

	getTooltips (): Map<number, TooltipInterface> {

		return this.tooltips;

	}

	private get2DPosition ( position: Vector3 ): Vector2 {

		const vector = position.clone().project( this.cameraService.camera );

		vector.x = ( vector.x + 1 ) / 2 * ( this.canvasService.width )
		vector.x += this.canvasService.left;

		vector.y = -( vector.y - 1 ) / 2 * ( this.canvasService.height );
		vector.y += this.canvasService.top;

		return new Vector2( vector.x, vector.y );
	}

	clear (): void {

		this.tooltips.forEach( ( tooltip ) => {
			this.tooltipRemoved.emit( tooltip );
		} );

		this.tooltips.clear();

	}
}
