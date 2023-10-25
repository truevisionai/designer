/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvPosTheta } from '../../../modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../../modules/tv-map/queries/tv-map-queries';
import { IHasSCoord } from '../snap-strategies/snapping';
import { MovingStrategy } from './move-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/modules/scenario/models/position';

export class LaneEndMoveStrategy extends MovingStrategy {

	constructor ( private lane: TvLane, private sValues: IHasSCoord[] = [] ) {
		super();
	}

	getPosTheta ( position: Vector3 ): TvPosTheta {

		const posTheta = this.lane.laneSection.road.getCoordAt( position );

		const s = posTheta.s - this.lane.laneSection.s;

		const laneEndPosition = this.getVector3( s );

		posTheta.x = laneEndPosition.x;
		posTheta.y = laneEndPosition.y;
		posTheta.z = laneEndPosition.z;
		posTheta.s = s;

		return posTheta;
	}

	getVector3 ( s: number ): Vector3 {

		return TvMapQueries.getLaneEndPosition( this.lane.roadId, this.lane.id, s );

	}

	getPosition ( e: PointerEventData ): Position {

		throw new Error( 'Method not implemented.' );

	}

}
