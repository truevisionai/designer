/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { TvRoad } from "../models/tv-road.model";
import { TvLaneSection } from "../models/tv-lane-section";
import { TvLane } from "../models/tv-lane";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvContactPoint, TvLaneSide } from "../models/tv-common";
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

				if ( connection.incomingRoad !== road ) continue;

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

				if ( connection.incomingRoad !== road ) continue;

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

	findRoadPosition ( road: TvRoad, sOffset: number, t: number ) {
		return road.getPosThetaAt( sOffset, t );
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @param tOffset
	 * @param withLaneHeight
	 */
	findLaneEndPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset = 0, withLaneHeight = true ) {

		const t = this.findWidthUpto( road, laneSection, lane, sOffset ) + tOffset;

		const sign = lane.id > 0 ? 1 : -1;

		const posTheta = road.getPosThetaAt( laneSection.s + sOffset, t * sign );

		if ( withLaneHeight ) {
			const laneHeight = lane.getHeightValue( sOffset );
			posTheta.z += laneHeight.getLinearValue( 1 );
		}

		return posTheta;
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @returns
	 */
	findLaneCenterPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset = 0, withLaneHeight = true ) {

		const t = this.findWidthUptoCenter( road, laneSection, lane, sOffset );

		const sign = lane.id >= 0 ? 1 : -1;

		const posTheta = road.getPosThetaAt( laneSection.s + sOffset, t * sign );

		if ( withLaneHeight ) {
			const laneHeight = lane.getHeightValue( sOffset );
			posTheta.z += laneHeight.getLinearValue( 1 );
		}

		return posTheta;
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @returns
	 */
	findWidthUpto ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let width = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			var element = lanes[ i ];

			width += element.getWidthValue( sOffset );

			if ( element.id == lane.id ) break;
		}

		return width;
	}

	findWidthUptoCenter ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let totalWidth = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			const laneWidth = currentLane.getWidthValue( sOffset );

			totalWidth += laneWidth;

			if ( currentLane.id == lane.id ) {

				totalWidth -= laneWidth / 2;
				break;
			}
		}

		return totalWidth;

	}
}
