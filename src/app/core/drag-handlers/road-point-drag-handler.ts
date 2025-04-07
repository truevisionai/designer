/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { PointerEventData } from "app/events/pointer-event-data";
import { BaseDragHandler } from "./base-drag-handler";
import { IHasPosition } from "app/objects/i-has-position";
import { TvRoad } from "app/map/models/tv-road.model";

export interface RoadPoint extends IHasPosition {
	road: TvRoad;
}

@Injectable( {
	providedIn: 'root'
} )
export class RoadPointDragHandler<T extends RoadPoint> extends BaseDragHandler<T> {

	constructor () {
		super();
	}

	onDragStart ( object: RoadPoint, e: PointerEventData ): void {
		// nothign to do
	}

	onDrag ( point: RoadPoint, e: PointerEventData ): void {

		const roadCoord = point.road.getRoadCoordinatesAt( e.point );

		if ( !roadCoord ) {
			this.setHint( 'Cannot drag point on non-road area' );
			return;
		}

		if ( roadCoord.road.isJunction ) {
			this.setHint( 'Cannot drag point on junction road' );
			return;
		}

		if ( roadCoord.road != point.road ) {
			this.setHint( 'Cannot drag point to different road' );
			return;
		}

		point.setPosition( roadCoord.position );

		this.dragEndPosition = roadCoord.position;

	}

	getDragTip ( point: RoadPoint ): string | null {

		const coord = point.road.getRoadCoordinatesAt( point.getPosition() );

		if ( !coord ) return;

		return `s: ${ coord.s.toFixed( 2 ) }, t:${ coord.t.toFixed( 2 ) }`;

	}

	onDragEnd ( point: RoadPoint, event: PointerEventData ): void {

		if ( this.dragStartPosition.distanceTo( this.dragEndPosition ) < 0.1 ) {
			return;
		}

		Commands.SetPosition( point, point.getPosition(), this.dragStartPosition );

	}

}
