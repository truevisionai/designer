/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/scenario/models/position';
import { MovingStrategy } from './move-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';


export class RoadLineMovingStrategy extends MovingStrategy<TvRoad> {

	getPosition ( event: PointerEventData, target: TvRoad ): Position {

		const posTheta = target.getPosThetaByPosition( event.point );

		return new RoadPosition( target, posTheta.s, 0 );

	}

}
