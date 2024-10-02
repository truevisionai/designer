/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLink, TvLinkType } from 'app/map/models/tv-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadNode } from 'app/objects/road/road-node';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkService {

	constructor (
	) {
	}

	setSuccessor ( prev: TvRoad, next: TvRoad, nextContact: TvContactPoint ) {

		// NOTE: these 2 lines are enough to link roads
		// except for junctions where we need to update connections
		// prev.successor?.linkRoad( next, TvContactPoint.END );
		// prev.linkSuccessor( next, nextContact );

		if ( prev.successor?.element instanceof TvRoad ) {

			prev.successor.element.setPredecessorRoad( next, TvContactPoint.END );

		} else if ( prev.successor?.element instanceof TvJunction ) {

			this.replaceJunctionLinks( prev.successor.element as TvJunction, prev, next, TvContactPoint.END );

		}

		if ( nextContact === TvContactPoint.START ) {

			next.successor = prev.successor?.clone();

			next.setPredecessorRoad( prev, TvContactPoint.END );

		} else {

			next.predecessor = prev.successor?.clone();

			next.setSuccessorRoad( prev, TvContactPoint.END );

		}

		prev.setSuccessorRoad( next, TvContactPoint.START );

		this.linkSuccessorLanes( prev, prev.successor );

		this.linkPredecessorLanes( next, next.predecessor );

	}

	replaceJunctionLinks ( junction: TvJunction, oldRoad: TvRoad, newRoad: TvRoad, contactPoint: TvContactPoint ) {

		junction.replaceIncomingRoad( oldRoad, newRoad, contactPoint );

	}

	updateSuccessorRelationWhileCut ( newRoad: TvRoad, link: TvLink, oldRoad: TvRoad, removed = false ) {

		if ( !newRoad.successor ) return;

		if ( !link ) return;

		if ( link.isRoad ) {

			const successorRoad = link.getElement<TvRoad>();

			if ( link.contactPoint == TvContactPoint.START ) {

				successorRoad.setPredecessorRoad( newRoad, TvContactPoint.END );

			} else if ( link.contactPoint == TvContactPoint.END ) {

				successorRoad.setSuccessorRoad( newRoad, TvContactPoint.END );

			}

		}

		if ( link.isJunction && removed ) {

			const junction = link.getElement<TvJunction>();

			// connections where old road was entering junction
			const incomingConnections = junction.getConnections().filter( i => i.incomingRoad == oldRoad );

			for ( let i = 0; i < incomingConnections.length; i++ ) {

				const connection = incomingConnections[ i ];

				connection.incomingRoad = newRoad;

				connection.laneLink.forEach( link => {

					link.incomingLane = newRoad.laneSections[ 0 ].getLaneById( link.incomingLane.id );

				} );

				connection.connectingRoad.setPredecessorRoad( newRoad, TvContactPoint.END );

			}

		}
	}

	updateSuccessorRelation ( road: TvRoad, previousSegment: TvRoad | TvJunction, link: TvLink, removed = false ) {

		if ( !link ) return;

		if ( !road.successor ) return;

		if ( !previousSegment ) return;

		if ( !( previousSegment instanceof TvRoad ) ) return;

		this.updateSuccessorRelationWhileCut( previousSegment, link, road, removed );

	}

	getLaneSection ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( contactPoint == TvContactPoint.START ) {

			return road.getLaneProfile().getFirstLaneSection();

		} else {

			return road.getLaneProfile().getLastLaneSection();
		}

	}

	/**
	 *
	 * @param firstNode
	 * @param secondNode
	 * @param joiningRoad
	 * @deprecated does not work as expected
	 */
	linkRoads ( firstNode: RoadNode, secondNode: RoadNode, joiningRoad: TvRoad ) {

		this.createLinksOld( firstNode, secondNode, joiningRoad );

	}

	/**
	 *
	 * @param firstNode
	 * @param secondNode
	 * @param joiningRoad
	 * @deprecated does not work as expected
	 */
	private createLinksOld ( firstNode: RoadNode, secondNode: RoadNode, joiningRoad: TvRoad ) {

		const firstRoad = firstNode.road;
		const secondRoad = secondNode.road;

		if ( firstNode.contact === TvContactPoint.START ) {

			// link will be negative as joining roaad will in opposite direction

			firstRoad.setPredecessor( TvLinkType.ROAD, joiningRoad, TvContactPoint.START );
			firstRoad.getLaneProfile().getFirstLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( -lane.id );
			} );

			joiningRoad.setPredecessor( TvLinkType.ROAD, firstRoad, TvContactPoint.START );
			joiningRoad.getLaneProfile().getFirstLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( -lane.id );
			} );

		} else {

			// links will be in same direction

			firstRoad.setSuccessor( TvLinkType.ROAD, joiningRoad, TvContactPoint.START );
			firstRoad.getLaneProfile().getLastLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( lane.id );
			} );

			joiningRoad.setPredecessor( TvLinkType.ROAD, firstRoad, TvContactPoint.END );
			joiningRoad.getLaneProfile().getFirstLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( lane.id );
			} );

		}

		if ( secondNode.contact === TvContactPoint.START ) {

			secondRoad.setPredecessor( TvLinkType.ROAD, joiningRoad, TvContactPoint.END );
			secondRoad.getLaneProfile().getFirstLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( lane.id );
			} );

			joiningRoad.setSuccessor( TvLinkType.ROAD, secondRoad, TvContactPoint.START );
			joiningRoad.getLaneProfile().getLastLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( lane.id );
			} );

		} else {

			secondRoad.setSuccessor( TvLinkType.ROAD, joiningRoad, TvContactPoint.END );
			secondRoad.getLaneProfile().getLastLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( -lane.id );
			} );

			joiningRoad.setSuccessor( TvLinkType.ROAD, secondRoad, TvContactPoint.END );
			joiningRoad.getLaneProfile().getLastLaneSection().lanesMap.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( -lane.id );
			} );

		}


	}

	private linkSuccessorLanes ( road: TvRoad, link: TvLink ) {

		if ( !link ) {
			Log.warn( "link is null", road.toString() );
			return
		}

		if ( link.isJunction ) return;

		const laneSection = road.getLaneProfile().getLastLaneSection();

		const otherLaneSection = this.getLaneSection( link.element as TvRoad, link.contactPoint );

		if ( !laneSection.isMatching( otherLaneSection ) ) {
			return;
		}

		const sign = link.contactPoint == TvContactPoint.START ? 1 : -1;

		laneSection.lanesMap.forEach( lane => {

			const otherLane = otherLaneSection.getLaneById( lane.id * sign );

			if ( otherLane ) {

				lane.successorId = otherLane.id;

				lane.successorUUID = otherLane.uuid;

			} else {

				lane.successorId == null;

				lane.successorUUID = null;

			}

		} );

	}

	private linkPredecessorLanes ( road: TvRoad, link: TvLink ) {

		if ( !link ) {
			Log.warn( "link is null", road.toString() );
			return
		}

		if ( link.isJunction ) return;

		const laneSection = road.getLaneProfile().getFirstLaneSection();

		const otherLaneSection = this.getLaneSection( link.element as TvRoad, link.contactPoint );

		if ( !laneSection.isMatching( otherLaneSection ) ) {
			return;
		}

		const sign = link.contactPoint == TvContactPoint.END ? 1 : -1;

		laneSection.lanesMap.forEach( lane => {

			const otherLane = otherLaneSection.getLaneById( lane.id * sign );

			if ( otherLane ) {

				lane.predecessorId = otherLane.id;

				lane.predecessorUUID = otherLane.uuid;

			} else {

				lane.predecessorId == null;

				lane.predecessorUUID = null;

			}

		} );
	}
}
