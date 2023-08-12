/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { SnackBar } from 'app/services/snack-bar.service';
import { Vector3 } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { EntityRef } from '../models/entity-ref';
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
	static reset () {
		// throw new Error( 'Method not implemented.' );
	}

	public static createPosition ( type: PositionType, position: Position ): Position {

		const vector3 = position ? position.getVectorPosition() : new Vector3( 0, 0, 0 );

		return this.createPositionFromVector( type, vector3, position.orientation );

	}

	public static createPositionFromVector ( type: PositionType, vector3: Vector3, orientation?: Orientation ) {

		if ( type == PositionType.World ) {

			return new WorldPosition( vector3.clone(), orientation?.clone() );

		}

		if ( type == PositionType.RelativeWorld ) {

			return new RelativeWorldPosition( null, vector3.x, vector3.y, vector3.z );

		}

		if ( type == PositionType.RelativeObject ) {

			return new RelativeObjectPosition( null, vector3.x, vector3.y, vector3.z );

		}

		if ( type == PositionType.Road ) {

			const posTheta = new TvPosTheta();

			const road = TvMapQueries.getRoadByCoords( vector3.x, vector3.y, posTheta );

			if ( road ) {

				return new RoadPosition( road.id, posTheta.s, posTheta.t, null );

			} else {

				TvConsole.error( `Road not found at ${ vector3.x }, ${ vector3.y }` );

			}

		}

		if ( type == PositionType.RelativeRoad ) {

			SnackBar.error( 'RelativeRoad position not implemented' );

		}

		if ( type == PositionType.Lane ) {

			return this.createLanePosition( vector3, null );

		}

		if ( type == PositionType.RelativeLane ) {

			return this.createRelativeLanePosition( null, vector3, orientation );

		}

		if ( type == PositionType.Route ) {

			SnackBar.error( 'Route position not implemented' );

		}

	}

	private static createLanePosition ( vector3: Vector3, orientation: Orientation ): LanePosition {

		const posTheta = new TvPosTheta();

		const results = TvMapQueries.getLaneByCoords( vector3.x, vector3.y, posTheta );

		if ( results ) {

			return new LanePosition( results.road.id, results.lane?.id || 0, 0, posTheta.s, orientation );

		} else {

			TvConsole.error( `Lane not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}

	public static createRelativeLanePosition ( entityRef: string, vector3: Vector3, orientation: Orientation ): RelativeLanePosition {

		return new RelativeLanePosition( new EntityRef( entityRef ), 0, 0, 0, 0, orientation );

	}

}
