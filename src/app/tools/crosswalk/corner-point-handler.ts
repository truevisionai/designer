/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from "../../events/pointer-event-data";
import { CornerControlPoint } from "./crosswalk-tool-debugger";
import { BasePointHandler } from "app/core/object-handlers/base-point-handler";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { Log } from "app/core/utils/log";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { Commands } from "app/commands/commands";
import { Vector3 } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class CornerControlPointHandler extends BasePointHandler<CornerControlPoint> {

	constructor (
		private roadObjectService: RoadObjectService,
		private roadGeometryService: RoadGeometryService
	) {
		super();
	}

	onAdded ( point: CornerControlPoint ): void {

		this.roadObjectService.addCornerAndUpdateObject( point.roadObject, point.corner );

	}

	onUpdated ( point: CornerControlPoint ): void {

		const coord = this.roadGeometryService.findRoadPositionAt( point.road, point.position );

		if ( !coord ) {
			Log.error( 'CornerControlPointHandler', 'onUpdated', 'Could not find coordinate for position' );
			return;
		}

		point.corner.s = coord.s;

		point.corner.t = coord.t;

		this.roadObjectService.updateRoadObject( point.road, point.roadObject );

	}

	onRemoved ( point: CornerControlPoint ): void {

		this.roadObjectService.removeCornerAndUpdateObject( point.roadObject, point.corner );

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
