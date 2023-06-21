/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { Vector3 } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { Position } from '../models/position';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { RelativeWorldPosition } from '../models/positions/tv-relative-world-position';
import { RoadPosition } from '../models/positions/tv-road-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PositionType } from '../models/tv-enums';
import { Orientation } from '../models/tv-orientation';

export class PositionFactory {

	public static createPosition ( type: PositionType, position?: Position ): Position {

		const vector3 = position ? position.toVector3() : undefined;
		const euler = position ? position.toEuler() : undefined;
		const orientation = position ? position.toOrientation() : undefined;

		switch ( type ) {
			case PositionType.World:
				return new WorldPosition(
					vector3?.x, vector3?.y, vector3?.z,
					euler?.x, euler?.y, euler?.z,
				);
				break;
			case PositionType.RelativeWorld:
				return new RelativeWorldPosition();
				break;
			case PositionType.RelativeObject:
				return new RelativeObjectPosition();
				break;
			case PositionType.Road:
				const posTheta = new TvPosTheta();
				const road = TvMapQueries.getRoadByCoords( vector3.x, vector3.y, posTheta );
				if ( road ) {
					return new RoadPosition( road.id, posTheta.s, posTheta.t, orientation );
				} else {
					TvConsole.error( `Road not found at ${ vector3.x }, ${ vector3.y }` );
				}
				break;
			case PositionType.RelativeRoad:
				throw new Error( 'Route position not implemented' );
				break;
			case PositionType.Lane:
				return this.createLanePosition( vector3, orientation );
				break;
			case PositionType.RelativeLane:
				return new RelativeLanePosition();
				break;
			case PositionType.Route:
				throw new Error( 'Route position not implemented' );
				break;

		}

	}

	private static createLanePosition ( vector3: Vector3, orientation: Orientation ): LanePosition {

		const posTheta = new TvPosTheta();

		const results = TvMapQueries.getLaneByCoords( vector3.x, vector3.y, posTheta );

		if ( results ) {

			return new LanePosition( results.road.id, results.lane.id, 0, posTheta.s, orientation );

		} else {

			TvConsole.error( `Lane not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}
}
