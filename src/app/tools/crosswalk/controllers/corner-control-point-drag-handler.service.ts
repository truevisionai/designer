/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointDragHandler } from "../../../core/drag-handlers/point-drag-handler.service";
import { CornerControlPoint } from "../objects/corner-control-point";
import { RoadGeometryService } from "../../../services/road/road-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";

@Injectable( {
	providedIn: 'root'
} )
export class CornerControlPointDragHandler extends PointDragHandler<CornerControlPoint> {

	constructor (
		private roadGeometryService: RoadGeometryService
	) {
		super();
	}

	onDragStart ( object: CornerControlPoint, e: PointerEventData ): void {
		// throw new Error( "Method not implemented." );
	}

	onDrag ( point: CornerControlPoint, e: PointerEventData ): void {

		const roadCoord = this.roadGeometryService.findRoadCoordStrict( point.road, e.point );

		if ( !roadCoord ) {
			this.setHint( 'Cannot drag crosswalk on non-road area' );
			return;
		}

		if ( roadCoord.road.isJunction ) {
			this.setHint( 'Cannot drag crosswalk on junction road' );
			return;
		}

		if ( roadCoord.road != point.road ) {
			this.setHint( 'Cannot drag crosswalk to different road' );
			return;
		}

		point.setPosition( roadCoord.position );

		this.dragEndPosition = roadCoord.position;

	}

	onDragEnd ( point: CornerControlPoint, e: PointerEventData ): void {

		if ( this.dragStartPosition.distanceTo( this.dragEndPosition ) < 0.1 ) {
			return;
		}

		Commands.UpdatePosition( point, point.position, this.dragStartPosition );

	}

}
