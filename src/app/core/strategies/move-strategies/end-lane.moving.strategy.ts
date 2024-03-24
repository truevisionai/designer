/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { Position } from 'app/scenario/models/position';
import { TvLane } from 'app/map/models/tv-lane';
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { MovingStrategy } from './move-strategy';

export class EndLaneMovingStrategy extends MovingStrategy<TvLane> {

	getPosition ( event: PointerEventData, target: TvLane ): Position {

		const posTheta = target.laneSection.road.getPosThetaByPosition( event.point );

		const s = posTheta.s - target.laneSection.s;

		// Debug.log( posTheta, s );
		const position = target.laneSection.road.getLaneEndPosition( target, s );

		// return new LanePositionv2( lane.laneSection.road, lane, s );
		return new WorldPosition( new Vector3( position.x, position.y, position.z ) );
	}

}

export class MidLaneMovingStrategy extends MovingStrategy<TvLane> {

	getPosition ( event: PointerEventData, target: TvLane ): Position {

		const posTheta = target.laneSection.road.getPosThetaByPosition( event.point );

		const s = posTheta.s - target.laneSection.s;

		// Debug.log( posTheta, s );
		const position = target.laneSection.road.getLaneCenterPosition( target, s );

		// return new LanePositionv2( lane.laneSection.road, lane, s );
		return new WorldPosition( new Vector3( position.x, position.y, position.z ) );
	}

}


