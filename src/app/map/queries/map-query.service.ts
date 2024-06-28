import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { TvRoad } from "../models/tv-road.model";
import { TvLaneSection } from "../models/tv-lane-section";
import { TvLane } from "../models/tv-lane";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvContactPoint } from "../models/tv-common";

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

	get junctions () {
		return this.mapService.junctions;
	}

	findLaneSuccessors ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		const successors: TvLane[] = []

		if ( lane.successorExists ) {

			const nextLaneSection = this.findNextLaneSection( road, laneSection );

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

			const prevLaneSection = this.findPreviousLaneSection( road, laneSection );

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

	findPreviousLaneSection ( road: TvRoad, laneSection: TvLaneSection ) {

		const index = road.laneSections.indexOf( laneSection );

		if ( index === 0 ) {

			if ( !road.predecessor ) return null;

			if ( !road.predecessor.isRoad ) return null;

			const predecessorRoad = road.predecessor.element as TvRoad;

			if ( road.predecessor.contactPoint == TvContactPoint.START ) {

				return predecessorRoad.laneSections[ 0 ];

			} else {

				return predecessorRoad.laneSections[ predecessorRoad.laneSections.length - 1 ];

			}

		}

		return road.laneSections[ index - 1 ];

	}

	findNextLaneSection ( road: TvRoad, laneSection: TvLaneSection ) {

		const index = road.laneSections.indexOf( laneSection );

		if ( index === road.laneSections.length - 1 ) {

			if ( !road.successor ) return null;

			if ( !road.successor.isRoad ) return null;

			const successorRoad = road.successor.element as TvRoad;

			if ( road.successor.contactPoint == TvContactPoint.START ) {

				return successorRoad.laneSections[ 0 ];

			} else {

				return successorRoad.laneSections[ successorRoad.laneSections.length - 1 ];

			}

		}

		return road.laneSections[ index + 1 ];

	}
}
