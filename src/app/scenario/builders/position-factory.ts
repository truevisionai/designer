/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Vector3 } from 'app/core/maths';
import { TvConsole } from '../../core/utils/console';
import { TvPosTheta } from '../../map/models/tv-pos-theta';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { EntityRef } from '../models/entity-ref';
import { Position } from '../models/position';
import { RelativeRoadPosition } from '../models/positions/relative-road.position';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { RelativeWorldPosition } from '../models/positions/tv-relative-world-position';
import { RoadPosition } from '../models/positions/tv-road-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PositionType } from '../models/tv-enums';
import { Orientation } from '../models/tv-orientation';
import { RoadService } from "../../services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class PositionFactory {

	constructor ( private roadService: RoadService ) {
	}

	public createPosition ( type: PositionType, position: Position, entity?: ScenarioEntity ): Position {

		const vector3 = position ? position.getVectorPosition() : new Vector3( 0, 0, 0 );

		return this.createPositionFromVector( type, vector3, position.orientation, entity );

	}

	private createPositionFromVector ( type: PositionType, vector3: Vector3, orientation?: Orientation, entity?: ScenarioEntity ): WorldPosition | RelativeWorldPosition | RelativeObjectPosition | RoadPosition | RelativeRoadPosition | LanePosition | RelativeLanePosition {

		if ( type == PositionType.World ) {

			return new WorldPosition( vector3.clone(), orientation?.clone() );

		}

		if ( type == PositionType.RelativeWorld ) {

			// Calculate the relative position based on the reference entity's position
			const delta = vector3.clone().sub( entity?.position || new Vector3( 0, 0, 0 ) );

			return new RelativeWorldPosition( new EntityRef( entity?.name ), delta, orientation?.clone() );

		}

		if ( type == PositionType.RelativeObject ) {

			// Calculate the relative position based on the reference entity's position
			const delta = vector3.clone().sub( entity?.position || new Vector3( 0, 0, 0 ) );

			return new RelativeObjectPosition( new EntityRef( entity?.name ), delta, orientation?.clone() );

		}

		if ( type == PositionType.Road ) {

			return this.createRoadPosition( vector3, orientation );

		}

		if ( type == PositionType.RelativeRoad ) {

			return this.createRelativeRoadPosition( null, vector3, orientation );

		}

		if ( type == PositionType.Lane ) {

			return this.createLanePosition( vector3, null );

		}

		if ( type == PositionType.RelativeLane ) {

			return this.createRelativeLanePosition( null, vector3, orientation );

		}

		if ( type == PositionType.Route ) {

			// SnackBar.error( 'Route position not implemented' );

		}

	}

	private createRoadPosition ( vector3: Vector3, orientation: Orientation ): RoadPosition {

		const posTheta = new TvPosTheta();

		const road = this.roadService.findNearestRoad( vector3, posTheta );

		if ( road ) {

			return new RoadPosition( road.id, posTheta.s, posTheta.t, null );

		} else {

			TvConsole.error( `Road not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}

	private createRelativeRoadPosition ( entity: EntityRef, vector3: Vector3, orientation: Orientation ): RelativeRoadPosition {

		const posTheta = new TvPosTheta();

		const road = this.roadService.findNearestRoad( vector3, posTheta );

		if ( road ) {

			return new RelativeRoadPosition( entity?.name, road.id, posTheta.s, posTheta.t, orientation );

		} else {

			TvConsole.error( `Road not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}

	private createRelativeLanePosition ( entityRef: string, vector3: Vector3, orientation: Orientation ): RelativeLanePosition {

		// return new RelativeLanePosition( new EntityRef( entityRef ), 0, 0, 0, 0, orientation );

		const posTheta = new TvPosTheta();

		const results = this.roadService.findNearestLane( vector3, posTheta );

		if ( results ) {

			return new RelativeLanePosition( new EntityRef( entityRef ), 0, 0, 0, 0, orientation );

		} else {

			TvConsole.error( `Lane not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}

	private createLanePosition ( vector3: Vector3, orientation: Orientation ): LanePosition {

		const posTheta = new TvPosTheta();

		const results = this.roadService.findNearestLane( vector3, posTheta );

		if ( results ) {

			return new LanePosition( results.road.id, results.lane?.id || 0, 0, posTheta.s, orientation );

		} else {

			TvConsole.error( `Lane not found at ${ vector3.x }, ${ vector3.y }` );

		}

	}

}
