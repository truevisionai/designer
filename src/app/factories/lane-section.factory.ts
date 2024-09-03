/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadNode } from "app/objects/road/road-node";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TurnType, TvContactPoint, TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvUtils } from "app/map/models/tv-utils";
import { LaneUtils } from "app/utils/lane.utils";
import { TvRoadLink } from "app/map/models/tv-road-link";
import { TvLane } from "app/map/models/tv-lane";

@Injectable( {
	providedIn: 'root'
} )
export class LaneSectionFactory {

	constructor () {
	}

	createSuccessorLaneSection ( road: TvRoad ) {

	}

	createFromRoadNode ( joiningRoad: TvRoad, firstNode: RoadNode, secondNode: RoadNode ): TvLaneSection[] {

		const laneSection = firstNode.road.getLaneProfile().getLaneSectionAtContact( firstNode.contact );

		const clone = laneSection.cloneAtS( 0, 0, null, joiningRoad );

		return [ clone ];

	}

	createFromRoadLink ( joiningRoad: TvRoad, firstNode: TvRoadLink, secondNode: TvRoadLink ): TvLaneSection[] {

		return this.createForJoiningRoad( joiningRoad, firstNode, secondNode );

	}

	createFromRoadCoord ( newRoad: TvRoad, previous: TvRoadCoord, next: TvRoadCoord ): TvLaneSection[] {

		// const incomingDirection = this.laneLinkService.determineDirection( previous.contact );
		// const outgoingDirection = this.laneLinkService.determineOutgoingDirection( previous, next );

		// const incomingLaneCoords = previous.laneSection.getLaneArray().filter( lane => lane.direction === incomingDirection ).models( lane => previous.toLaneCoord( lane ) );
		// const outgoingLaneCoords = next.laneSection.getLaneArray().filter( lane => lane.direction === outgoingDirection ).models( lane => next.toLaneCoord( lane ) );

		// const roadLength = newRoad.getRoadLength();

		if ( false && previous.laneSection.isMatching( next.laneSection ) ) {

			const laneSection = previous.laneSection.cloneAtS( 0, 0, null, newRoad );

			const lanes = laneSection.getLaneArray();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( previous.contact == TvContactPoint.END ) {

					lane.predecessorId = previous.laneSection.getNearestLane( lane )?.id;

				} else {

					lane.predecessorId = -previous.laneSection.getNearestLane( lane )?.id;

				}

				if ( next.contact == TvContactPoint.START ) {

					lane.successorId = next.laneSection.getNearestLane( lane )?.id;

				} else {

					lane.successorId = -next.laneSection.getNearestLane( lane )?.id;

				}

			}

			return [ laneSection ];

		} else {

			const laneSection = this.createLaneSection( newRoad );

			const prevLanes = previous.laneSection.getLaneArray();
			const nextLanes = next.laneSection.getLaneArray();

			const laneCount = Math.max(
				previous.laneSection.lanesMap.size,
				next.laneSection.lanesMap.size
			);

			const leftLanes = previous.laneSection.getLeftLaneCount() >= next.laneSection.getLeftLaneCount() ?
				previous.laneSection.getLeftLanes() :
				next.laneSection.getLeftLanes();

			const rightLanes = previous.laneSection.getRightLaneCount() >= next.laneSection.getRightLaneCount() ?
				previous.laneSection.getRightLanes() :
				next.laneSection.getRightLanes();

			laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

			for ( let i = 0; i < leftLanes.length; i++ ) {

				laneSection.createLane( TvLaneSide.LEFT, leftLanes[ i ].id, leftLanes[ i ].type, false, false );

			}

			for ( let i = 0; i < rightLanes.length; i++ ) {

				laneSection.createLane( TvLaneSide.RIGHT, rightLanes[ i ].id, rightLanes[ i ].type, false, false );

			}

			laneSection.sortLanes();

			for ( const lane of laneSection.lanesMap.values() ) {

				if ( lane.id == 0 ) continue;

				const prevLane = previous.laneSection.getNearestLane( lane );
				const nextLane = next.laneSection.getNearestLane( lane );

				if ( previous.contact == TvContactPoint.END && prevLane ) {

					lane.predecessorId = prevLane?.id;

				} else if ( prevLane ) {

					lane.predecessorId = -prevLane?.id;

				}

				if ( next.contact == TvContactPoint.START && nextLane ) {

					lane.successorId = nextLane?.id;

				} else if ( nextLane ) {

					lane.successorId = -nextLane?.id;

				}

				if ( !prevLane && !nextLane ) {

					// laneSection.removeLane( lane );

				}

			}

			return [ laneSection ];
		}

	}

	getIncomingLanes ( predecessor: TvRoadCoord ): TvLaneCoord[] {

		const incomingDirection = LaneUtils.determineDirection( predecessor.contact );

		return predecessor.laneSection.getLaneArray()
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => predecessor.toLaneCoord( lane ) );

	}

	/**
	 * Creates a lane section for a connecting road.
	 * Only right lanes are created.
	 */
	createForConnectingRoad ( connectingRoad: TvRoad, predecessor: TvRoadCoord, successor: TvRoadCoord ): TvLaneSection[] {

		const laneSection = this.createLaneSection( connectingRoad );

		const incomingDirection = LaneUtils.determineDirection( predecessor.contact );
		const outgoingDirection = LaneUtils.determineOutDirection( successor.contact );

		const incomingLaneCoords = predecessor.laneSection.getLaneArray()
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => predecessor.toLaneCoord( lane ) )

		const outgoingLaneCoords = successor.laneSection.getLaneArray()
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => successor.toLaneCoord( lane ) )

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const coords = incomingLaneCoords.length >= outgoingLaneCoords.length ?
			incomingLaneCoords :
			outgoingLaneCoords;

		let id = 0;

		if ( incomingDirection == 'forward' ) {
			coords.sort( ( a, b ) => a.lane.id > b.lane.id ? -1 : 1 );
		} else {
			coords.sort( ( a, b ) => a.lane.id > b.lane.id ? 1 : -1 );
		}

		for ( let i = 0; i < coords.length; i++ ) {

			const coord = coords[ i ];

			const prevLane = TvLaneSection.getNearestLane( incomingLaneCoords.map( i => i.lane ), coord.lane );

			const nextLane = TvLaneSection.getNearestLane( outgoingLaneCoords.map( i => i.lane ), coord.lane );

			if ( prevLane && nextLane ) {

				id++;

				const lane = laneSection.createLane(
					TvLaneSide.RIGHT,
					-id,
					coord.lane.type,
					true,
					true
				);

				if ( prevLane ) {
					lane.predecessorId = prevLane.id;
				}

				if ( nextLane ) {
					lane.successorId = nextLane.id;
				}

				lane.width.splice( 0, lane.width.length );

				const widhtAtStart = prevLane?.getWidthValue( 0 ) || 0;

				const widthAtEnd = nextLane?.getWidthValue( 0 ) || 0;

				lane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

				lane.addWidthRecord( connectingRoad.length, widthAtEnd, 0, 0, 0 );

				TvUtils.computeCoefficients( lane.width, connectingRoad.length );

			}
		}

		laneSection.sortLanes();

		// update id
		// const lanes = laneSection.getLaneArray();
		// for ( let i = 0; i < lanes.length; i++ ) {
		// 	lanes[ i ].id = -i;
		// }

		return [ laneSection ];

	}

	/**
	 *
	 * @param connection
	 * @param predecessor
	 * @param successor
	 * @returns
	 * @deprecated not working
	 */
	createForSingleManeuver ( connection: TvJunctionConnection, predecessor: TvRoadCoord, successor: TvRoadCoord ): TvLaneSection {

		const laneSection = this.createLaneSection( connection.connectingRoad );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const maneuverLane = laneSection.createLane( TvLaneSide.RIGHT, -1, TvLaneType.none, false, false );

		const predecessorLane = predecessor.laneSection.getNearestLane( maneuverLane );
		const successorLane = successor.laneSection.getNearestLane( maneuverLane );

		if ( predecessorLane || successorLane ) {
			maneuverLane.type = predecessorLane?.type || successorLane?.type;
		}

		if ( predecessorLane ) {
			maneuverLane.predecessorId = predecessorLane?.id
		}

		if ( successorLane ) {
			maneuverLane.successorId = successorLane?.id
		}

		return laneSection;

	}

	createForJoiningRoad ( joiningRoad: TvRoad, predecessor: TvRoadLink, successor: TvRoadLink ): TvLaneSection[] {

		const laneSection = this.createLaneSection( joiningRoad );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		// this.createBothSides( laneSection, joiningRoad, predecessor, successor );
		// this.createRightSide( laneSection, joiningRoad, successor, predecessor );
		this.clonePredcessorSection( laneSection, joiningRoad, predecessor, successor );

		return [ laneSection ];
	}

	createRightSide ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvRoadLink, successor: TvRoadLink ) {

		const processed = new Set<TvLane>();

		// first we'll process right side lanes of incoming
		const incomingCoords = LaneUtils.createIncomingCoords( predecessor, false );
		const outgoingCoords = LaneUtils.createOutgoingCoords( successor, false );

		// const highest: TvLane = LaneUtils.findRightMostIncomingLane( predecessor );
		// const lowest: TvLane = LaneUtils.findLeftMostIncomingLane( successor );

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incoming = incomingCoords[ i ];

			if ( incoming.lane.id == 0 ) continue;
			if ( processed.has( incoming.lane ) ) continue;

			for ( let j = 0; j < outgoingCoords.length; j++ ) {

				const outgoing = outgoingCoords[ j ];

				if ( outgoing.lane.id == 0 ) continue;
				if ( processed.has( outgoing.lane ) ) continue;
				if ( outgoing.lane.type != incoming.lane.type ) continue;

				const lane = laneSection.createLane( incoming.lane.side, incoming.lane.id, incoming.lane.type, true, true );
				lane.predecessorId = incoming.lane.id;
				lane.successorId = outgoing.lane.id;

				processed.add( incoming.lane );

				processed.add( outgoing.lane );

				break;

			}

		}

	}

	createBothSides ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvRoadLink, successor: TvRoadLink ) {

		const leftLanes = predecessor.laneSection.getLeftLanes();

		for ( let i = 0; i < leftLanes.length; i++ ) {

			const leftLane = leftLanes[ i ];

			const lane = laneSection.createLane( leftLane.side, leftLane.id, leftLane.type, true, true );

			lane.predecessorId = leftLane.id;

		}

		const rightLanes = predecessor.laneSection.getRightLanes();

		for ( let i = 0; i < rightLanes.length; i++ ) {

			const rightLane = rightLanes[ i ];

			const lane = laneSection.createLane( rightLane.side, rightLane.id, rightLane.type, true, true );

			lane.predecessorId = rightLane.id;

		}

	}

	clonePredcessorSection ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvRoadLink, successor: TvRoadLink ) {

		const sOffset = predecessor.contact == TvContactPoint.START ? 0 : road.length;

		const clone = predecessor.laneSection.cloneAtS( sOffset );

		const lanes = clone.getLaneArray();

		for ( let i = 0; i < lanes.length; i++ ) {

			laneSection.addLaneInstance( lanes[ i ] );

		}

	}

	createFromBToA () {

		// const laneSection = this.createLaneSection( connectingRoad );

	}

	private createLaneSection ( road: TvRoad ) {

		return new TvLaneSection( road.laneSections.length, 0, false, road );

	}

}
