/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "../../../events/pointer-event-data";
import { MovingStrategy } from "./move-strategy";
import { Position } from "app/scenario/models/position";
import { LanePosition, NewLanePosition } from "app/scenario/models/positions/tv-lane-position";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";

export class AnyLaneMovingStrategy extends MovingStrategy<TvLane> {

	constructor ( private contact?: TvContactPoint ) {

		super();

	}

	getPosition ( e: PointerEventData, targetLane?: TvLane ): Position {

		const laneCoord = this.onLaneCoord( e );

		if ( !laneCoord ) return;

		let offset = 0;

		if ( this.contact == TvContactPoint.START ) {
			offset -= laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		if ( this.contact == TvContactPoint.END ) {
			offset += laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		return new NewLanePosition( laneCoord.road, laneCoord.laneSection, laneCoord.lane, laneCoord.s, offset );

	}

}
