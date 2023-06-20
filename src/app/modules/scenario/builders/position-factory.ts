/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { RelativeWorldPosition } from '../models/positions/tv-relative-world-position';
import { RoadPosition } from '../models/positions/tv-road-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { EntityObject } from '../models/tv-entities';
import { PositionType } from '../models/tv-enums';

export class PositionFactory {

	public static createPosition ( type: PositionType, entity?: EntityObject ) {

		switch ( type ) {
			case PositionType.World:
				return new WorldPosition();
				break;
			case PositionType.RelativeWorld:
				return new RelativeWorldPosition();
				break;
			case PositionType.RelativeObject:
				return new RelativeObjectPosition();
				break;
			case PositionType.Road:
				return new RoadPosition();
				break;
			case PositionType.RelativeRoad:
				throw new Error( 'Route position not implemented' );
				break;
			case PositionType.Lane:
				return new LanePosition();
				break;
			case PositionType.RelativeLane:
				return new RelativeLanePosition();
				break;
			case PositionType.Route:
				throw new Error( 'Route position not implemented' );
				break;

		}

	}
}
