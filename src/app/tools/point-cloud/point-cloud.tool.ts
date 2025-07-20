/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { Injectable } from '@angular/core';
import { isPointCloudObject, PointCloudObject } from 'app/assets/point-cloud/point-cloud-object';
import { MapService } from 'app/services/map/map.service';
import { PointCloudInspector } from './point-cloud-inspector';
import { Commands } from 'app/commands/commands';
import { Vector3 } from 'three';

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

	private dragStartPosition: Vector3 | null = null;
	private dragObject: PointCloudObject | null = null;
	private dragOriginalPosition: Vector3 | null = null;

	onPointerDown ( event: PointerEventData ): void {
		if ( isPointCloudObject( event.object ) ) {
			this.selectObject( event.object, this.selectionService.getLastSelectedObject() );
			this.dragStartPosition = event.intersections.length > 0 ? event.intersections[ 0 ].point.clone() : null;
			this.dragObject = event.object;
			this.dragOriginalPosition = this.dragObject.position.clone();
		} else if ( this.selectionService.getSelectedObjectCount() > 0 ) {
			this.unselectObject( this.selectionService.getLastSelectedObject() );
		}
	}

	onPointerMoved ( event: PointerEventData ): void {
		if ( !this.dragStartPosition || !this.dragObject ) return;

		const newPoint = event.intersections && event.intersections.length > 0
			? event.intersections[ 0 ].point
			: event.point;
		if ( !newPoint ) return;

		const delta = newPoint.clone().sub( this.dragStartPosition );
		this.dragObject.position.add( delta );

		// Update the start position for continuous dragging
		this.dragStartPosition.copy( newPoint );
	}

	onPointerUp ( event: PointerEventData ): void {

		if ( this.dragObject && this.dragOriginalPosition ) {
			const moved = !this.dragObject.position.equals( this.dragOriginalPosition );
			if ( moved ) {
				console.log( 'Point cloud moved from', this.dragOriginalPosition, 'to', this.dragObject.position );
				Commands.SetPosition( this.dragObject, this.dragObject.position, this.dragOriginalPosition );
			}
		}

		this.dragStartPosition = null;
		this.dragObject = null;
		this.dragOriginalPosition = null;
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
			this.clearInspector();
			console.warn( 'PointCloudTool.onObjectSelected: Object is not a PointCloudObject', object );
		}
	}

	onObjectUnselected ( object: any ): void {
		this.clearInspector();
	}

}
