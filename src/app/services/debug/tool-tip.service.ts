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

	public tooltipAdded = new EventEmitter<TooltipInterface>();
	public tooltipUpdated = new EventEmitter<TooltipInterface>();
	public tooltipRemoved = new EventEmitter<TooltipInterface>();

	private tooltips = new Map<number, TooltipInterface>();

	constructor (
		private canvasService: CanvasService,
		private cameraService: CameraService
	) { }

	createFrom3D ( text: string, position: Vector3 ) {

		const id = this.tooltips.size + 1;

		const position2D = this.get2DPosition( position );

		return this.createTooltip( id, text, position2D );

	}

	private createTooltip ( id: number, content: string, position: Vector2 ) {

		const toolTip = { id, content, position };

		this.tooltips.set( id, toolTip );

		this.tooltipAdded.emit( toolTip );

		return toolTip;
	}

	private updateTooltipPosition ( id: number, position: Vector2 ) {

		if ( this.tooltips.has( id ) ) {

			const tooltip = this.tooltips.get( id );

			tooltip.position = position;

			this.tooltipUpdated.emit( tooltip );

		}

	}

	updateTooltipContent ( id: number, content: string ) {

		if ( this.tooltips.has( id ) ) {

			const tooltip = this.tooltips.get( id );

			tooltip.content = content;

			this.tooltipUpdated.emit( tooltip );

		}

	}

	removeToolTip ( toolTip: TooltipInterface ) {

		if ( this.tooltips.has( toolTip.id ) ) {

			this.tooltips.delete( toolTip.id );

			this.tooltipRemoved.emit( toolTip );


		}

	}

	getTooltips () {

		return this.tooltips;

	}

	private get2DPosition ( position: Vector3 ) {

		const vector = position.clone().project( this.cameraService.camera );

		vector.x = ( vector.x + 1 ) / 2 * ( this.canvasService.width )
		vector.x += this.canvasService.left;

		vector.y = - ( vector.y - 1 ) / 2 * ( this.canvasService.height );
		vector.y += this.canvasService.top;

		return new Vector2( vector.x, vector.y );
	}
}
