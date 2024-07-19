/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { TvRoad } from "../models/tv-road.model";
import { TvLaneSection } from "../models/tv-lane-section";
import { TvLane } from "../models/tv-lane";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvContactPoint } from "../models/tv-common";
import { LaneUtils } from 'app/utils/lane.utils';

@Injectable( {
	providedIn: 'root'
} )
export class MapQueryService {

	constructor (
		private mapService: MapService,
	) {
	}

	get map () {
		return this.mapService.map;
	}

	get roads () {
		return this.mapService.roads;
	}

	get splines () {
		return this.mapService.splines;
	}

	get nonJunctionSplines () {
		return this.mapService.nonJunctionSplines;
	}

	get junctions () {
		return this.mapService.junctions;
	}

	findLaneSuccessors ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		const successors: TvLane[] = []

		if ( lane.successorExists ) {

			const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

			if ( !nextLaneSection ) return [];

			const nextLane = nextLaneSection.getLaneById( lane.successorId );

			if ( nextLane ) {
				successors.push( nextLane );
			}

			return successors;
		}

		if ( !lane.successorExists && road.successor?.isJunction ) {

			const junction = road.successor.element as TvJunction;

			for ( const connection of junction.getConnections() ) {

				if ( connection.incomingRoad != road ) continue;

				for ( const laneLink of connection.laneLink ) {

					if ( laneLink.from != lane.id ) continue;

					const connectingLane = connection.connectingLaneSection.getLaneById( laneLink.to );

					if ( connectingLane ) successors.push( connectingLane );

				}

			}

		}

		if ( !lane.successorExists && road.predecessor?.isJunction && lane.isRight ) {

			const junction = road.predecessor.element as TvJunction;

			for ( const connection of junction.getConnections() ) {

				if ( connection.outgoingRoad != road ) continue;

				for ( const laneLink of connection.laneLink ) {

					const connectingLane = connection.connectingLaneSection.getLaneById( laneLink.to );

					if ( connectingLane.successorId == lane.id ) {

						successors.push( connectingLane );

					}
				}

			}
		}

		return successors;

	}

	findLanePredecessors ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		const predecessors: TvLane[] = []

		if ( lane.predecessorExists ) {

			const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );

			if ( !prevLaneSection ) return [];

			const predecessorLane = prevLaneSection.getLaneById( lane.predecessorId );

			if ( predecessorLane ) {
				predecessors.push( predecessorLane );
			}

			return predecessors;
		}

		if ( !lane.predecessorExists && road.predecessor?.isJunction ) {

			const junction = road.predecessor.element as TvJunction;

			for ( const connection of junction.getConnections() ) {

				if ( connection.incomingRoad != road ) continue;

				for ( const laneLink of connection.laneLink ) {

					if ( laneLink.from != lane.id ) continue;

					const connectingLane = connection.connectingLaneSection.getLaneById( laneLink.to );

					if ( connectingLane ) predecessors.push( connectingLane );

				}

			}

		}

		if ( !lane.predecessorExists && road.successor?.isJunction && lane.isLeft ) {

			const junction = road.successor.element as TvJunction;

			for ( const connection of junction.getConnections() ) {

				if ( connection.outgoingRoad != road ) continue;

				for ( const laneLink of connection.laneLink ) {

					const connectingLane = connection.connectingLaneSection.getLaneById( laneLink.to );

					if ( connectingLane.successorId == lane.id ) {

						predecessors.push( connectingLane );

					}
				}

			}
		}

		return predecessors;

	}

}
