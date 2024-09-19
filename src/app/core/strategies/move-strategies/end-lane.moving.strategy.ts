/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { Position } from 'app/scenario/models/position';
import { TvLane } from 'app/map/models/tv-lane';
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { MovingStrategy } from './move-strategy';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { LanePosition, NewLanePosition } from 'app/scenario/models/positions/tv-lane-position';
import { Maths } from 'app/utils/maths';

export class EndLaneMovingStrategy extends MovingStrategy<TvLane> {

	getPosition ( event: PointerEventData, target: TvLane ): Position {

		const roadCoord = target.laneSection.road.getPosThetaByPosition( event.point );

		const s = Maths.clamp( roadCoord.s - target.laneSection.s, 0, target.laneSection.getLength() );

		return new NewLanePosition( target.laneSection.road, target.laneSection, target, s, 0 );
	}

}

export class MidLaneMovingStrategy extends MovingStrategy<TvLane> {

	getPosition ( event: PointerEventData, target: TvLane ): Position {

		const posTheta = target.laneSection.road.getPosThetaByPosition( event.point );

		// Debug.log( posTheta, s );
		const position = target.laneSection.road.getLaneCenterPosition( target, posTheta.s );

		// return new LanePositionv2( lane.laneSection.road, lane, s );
		return new WorldPosition( new Vector3( position.x, position.y, position.z ) );
	}

}


