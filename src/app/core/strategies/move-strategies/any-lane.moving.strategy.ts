/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "../../../events/pointer-event-data";
import { MovingStrategy } from "./move-strategy";
import { Position } from "app/scenario/models/position";
import { LanePosition } from "app/scenario/models/positions/tv-lane-position";
import { TvContactPoint } from "app/map/models/tv-common";

export class AnyLaneMovingStrategy extends MovingStrategy<any> {

	constructor ( private contact?: TvContactPoint ) {

		super();

	}

	getPosition ( e: PointerEventData ): Position {

		const laneCoord = this.onLaneCoord( e );

		if ( !laneCoord ) return;

		let offset = 0;

		if ( this.contact == TvContactPoint.START ) {
			offset -= laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		if ( this.contact == TvContactPoint.END ) {
			offset += laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		return new LanePosition( laneCoord.roadId, laneCoord.laneId, offset, laneCoord.s, null );

	}

}
