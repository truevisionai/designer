/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/scenario/models/position';
import { MovingStrategy } from './move-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';


export class OnRoadMovingStrategy extends MovingStrategy<TvRoad> {

	constructor ( private includeJunctionRoads = false ) {
		super();
	}

	getPosition ( event: PointerEventData, target?: TvRoad ): Position {

		const coord = this.onRoadGeometry( event );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		if ( target && coord.road != target ) {
			return;
		}

		return new RoadPosition( coord.road, coord.s, coord.t );
	}

}
