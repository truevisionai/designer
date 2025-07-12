/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { Injectable } from '@angular/core';
import { isPointCloudObject } from 'app/assets/point-cloud/point-cloud-object';
import { MapService } from 'app/services/map/map.service';
import { PointCloudInspector } from './point-cloud-inspector';

@Injectable( {
	providedIn: 'root'
} )
export class PointCloudTool extends BaseTool<any> {

	public name: string = 'PointCloudTool';

	public toolType = ToolType.PointCloudTool;

	constructor ( private mapService: MapService ) {

		super();

		this.setHint( 'PointCloud Tool is used to manage point cloud assets in the scene' );
	}

	init (): void {

		// this.selectionService.registerStrategy( PointCloudAsset, new PointCloudSelectionStrategy() );

	}

	onPointerDown ( event: PointerEventData ): void {

		console.log( 'PointCloudTool.onPointerDown', event );

		if ( isPointCloudObject( event.object ) ) {

			this.selectObject( event.object, this.currentSelectedObject );

			console.log( 'PointCloudTool.onPointerDown: PointCloudObject selected', event.object );

		}

	}

	onPointerMoved ( pointerEventData: PointerMoveData ): void {

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

	}

	onObjectRemoved ( object: any ): void {
		if ( isPointCloudObject( object ) ) {
			this.selectionService.removeFromSelected( object );
			this.mapService.map.removePointCloud( object );
		}
	}

	onObjectAdded ( object: any ): void {
		if ( isPointCloudObject( object ) ) {
			this.mapService.map.addPointCloud( object );
			this.selectionService.addToSelected( object );
		}
	}

	onObjectSelected ( object: any ): void {
		if ( isPointCloudObject( object ) ) {
			this.setInspector( new PointCloudInspector( object ) );
		} else {
			console.warn( 'PointCloudTool.onObjectSelected: Object is not a PointCloudObject', object );
		}
	}

}
