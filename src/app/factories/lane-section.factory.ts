/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadNode } from "app/objects/road/road-node";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvContactPoint, TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";
import { LaneUtils } from "app/utils/lane.utils";
import { TvLink } from "app/map/models/tv-link";
import { TvLane } from "app/map/models/tv-lane";

@Injectable( {
	providedIn: 'root'
} )
export class LaneSectionFactory {

	constructor () {
	}

	static createLaneSection ( leftCount: number, leftWidth: number, rightCount: number, rightWidth: number ): TvLaneSection {

		const laneSection = new TvLaneSection( 0, 0, true, null );

		for ( let i = 1; i <= leftCount; i++ ) {

			const lane = laneSection.createLeftLane( i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, leftWidth, 0, 0, 0 );

		}

		for ( let i = 1; i <= rightCount; i++ ) {

			const lane = laneSection.createRightLane( -i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, rightWidth, 0, 0, 0 );

		}

		laneSection.createCenterLane( 0, TvLaneType.driving, false, true );

		return laneSection;
	}

	static createFromRoadNode ( firstNode: RoadNode, secondNode: RoadNode ): TvLaneSection[] {

		const sectionA = firstNode.road.getLaneProfile().getLaneSectionAtContact( firstNode.contact );

		const sectionB = secondNode.road.getLaneProfile().getLaneSectionAtContact( secondNode.contact );

		const clone = sectionA.cloneAtS( 0, 0, null );

		return [ clone ];

	}

	static createFromRoadCoord ( previousRoad: TvRoadCoord | RoadNode, nextRoad: TvRoadCoord | RoadNode ): TvLaneSection[] {

		const isLaneSectionMatching = previousRoad.laneSection.isMatching( nextRoad.laneSection );

		if ( isLaneSectionMatching ) {

			const laneSection = previousRoad.laneSection.cloneAtS( 0, 0, null );

			laneSection.linkPredecessor( previousRoad.laneSection, previousRoad.contact );
			laneSection.linkSuccessor( nextRoad.laneSection, nextRoad.contact );

			return [ laneSection ];

		} else {

			const firstSection = previousRoad.laneSection.cloneAtS( 0, 0, null );
			const secondSection = nextRoad.laneSection.cloneAtS( 0, 0, null );

			firstSection.linkPredecessor( previousRoad.laneSection, previousRoad.contact );
			firstSection.linkSuccessor( secondSection, TvContactPoint.START );

			secondSection.linkPredecessor( firstSection, TvContactPoint.END );
			secondSection.linkSuccessor( nextRoad.laneSection, nextRoad.contact );

			return [ firstSection, secondSection ]

		}

	}

	createFromRoadLink ( joiningRoad: TvRoad, firstNode: TvLink, secondNode: TvLink ): TvLaneSection[] {

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

			const lanes = laneSection.getLanes();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( previous.contact == TvContactPoint.END ) {

					lane.predecessorId = previous.laneSection.getNearestLane( lane )?.id;

				} else {

					lane.predecessorId = -previous.laneSection.getNearestLane( lane )?.id;

				}

				if ( next.contact == TvContactPoint.START ) {

					const nearest = next.laneSection.getNearestLane( lane );

					if ( nearest ) {
						lane.setSuccessor( nearest );
					} else {
						lane.unsetSuccessor();
					}

				} else {

					lane.successorId = -next.laneSection.getNearestLane( lane )?.id;

				}

			}

			return [ laneSection ];

		} else {

			const laneSection = this.createLaneSection( newRoad );

			const prevLanes = previous.laneSection.getLanes();
			const nextLanes = next.laneSection.getLanes();

			const laneCount = Math.max(
				previous.laneSection.getLaneCount(),
				next.laneSection.getLaneCount()
			);

			const leftLanes = previous.laneSection.getLeftLaneCount() >= next.laneSection.getLeftLaneCount() ?
				previous.laneSection.getLeftLanes() :
				next.laneSection.getLeftLanes();

			const rightLanes = previous.laneSection.getRightLaneCount() >= next.laneSection.getRightLaneCount() ?
				previous.laneSection.getRightLanes() :
				next.laneSection.getRightLanes();

			laneSection.createCenterLane( 0, TvLaneType.none, false, false );

			for ( let i = 0; i < leftLanes.length; i++ ) {

				laneSection.createLeftLane( leftLanes[ i ].id, leftLanes[ i ].type, false, false );

			}

			for ( let i = 0; i < rightLanes.length; i++ ) {

				laneSection.createRightLane( rightLanes[ i ].id, rightLanes[ i ].type, false, false );

			}

			laneSection.sortLanes();

			for ( const lane of laneSection.getLanes() ) {

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

	/**
	 * Creates a lane section for a connecting road.
	 * Only right lanes are created.
	 */
	createForConnectingRoad ( connectingRoad: TvRoad, predecessor: TvRoadCoord, successor: TvRoadCoord ): TvLaneSection[] {

		const laneSection = this.createLaneSection( connectingRoad );

		const incomingDirection = LaneUtils.determineDirection( predecessor.contact );
		const outgoingDirection = LaneUtils.determineOutDirection( successor.contact );

		const incomingLaneCoords = predecessor.laneSection.getLanes()
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => predecessor.toLaneCoord( lane ) )

		const outgoingLaneCoords = successor.laneSection.getLanes()
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => successor.toLaneCoord( lane ) )

		laneSection.createCenterLane( 0, TvLaneType.none, false, false );

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
					lane.setPredecessor( prevLane );
				}

				if ( nextLane ) {
					lane.setSuccessor( nextLane );
				}

				lane.clearLaneWidth();

				const widhtAtStart = prevLane?.getWidthValue( 0 ) || 0;

				const widthAtEnd = nextLane?.getWidthValue( 0 ) || 0;

				lane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

				lane.addWidthRecord( connectingRoad.length, widthAtEnd, 0, 0, 0 );

				lane.updateWidthCoefficients();

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

	createForJoiningRoad ( joiningRoad: TvRoad, predecessor: TvLink, successor: TvLink ): TvLaneSection[] {

		const laneSection = this.createLaneSection( joiningRoad );

		laneSection.createCenterLane( 0, TvLaneType.none, false, false );

		// this.createBothSides( laneSection, joiningRoad, predecessor, successor );
		// this.createRightSide( laneSection, joiningRoad, successor, predecessor );
		this.clonePredcessorSection( laneSection, joiningRoad, predecessor, successor );

		return [ laneSection ];
	}

	createRightSide ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvLink, successor: TvLink ) {

		const processed = new Set<TvLane>();

		// first we'll process right side lanes of incoming
		const incomingCoords = predecessor.laneSection.getIncomingCoords( predecessor.contact, false );
		const outgoingCoords = successor.laneSection.getOutgoingCoords( successor.contact, false );

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

				lane.setLinks( incoming.lane, outgoing.lane );

				processed.add( incoming.lane );

				processed.add( outgoing.lane );

				break;

			}

		}

	}

	createBothSides ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvLink, successor: TvLink ) {

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

	clonePredcessorSection ( laneSection: TvLaneSection, road: TvRoad, predecessor: TvLink, successor: TvLink ) {

		const sOffset = predecessor.contact == TvContactPoint.START ? 0 : road.length;

		const clone = predecessor.laneSection.cloneAtS( sOffset );

		const lanes = clone.getLanes();

		for ( let i = 0; i < lanes.length; i++ ) {

			laneSection.addLaneInstance( lanes[ i ] );

		}

	}

	private createLaneSection ( road: TvRoad ) {

		return new TvLaneSection( road.laneSections.length, 0, false, road );

	}

}
