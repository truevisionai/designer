/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvUtils } from 'app/map/models/tv-utils';

@Injectable( {
	providedIn: 'root'
} )
export class LaneLinkService {

	constructor () { }

	createDrivingLinks ( connection: TvJunctionConnection, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		const incomingDirection = this.determineDirection( incoming.contact );
		const outgoingDirection = this.determineOutgoingDirection( incoming, outgoing );

		const incomingLaneCoords = incoming.laneSection.getLaneArray()
			.filter( lane => lane.type == TvLaneType.driving || lane.type == TvLaneType.shoulder )
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => incoming.toLaneCoord( lane ) );

		const outgoingLaneCoords = outgoing.laneSection.getLaneArray()
			.filter( lane => lane.type == TvLaneType.driving || lane.type == TvLaneType.shoulder )
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => outgoing.toLaneCoord( lane ) );

		for ( let i = 0; i < incomingLaneCoords.length; i++ ) {

			const laneCoord = incomingLaneCoords[ i ];

			const link = this.createLink(
				connection,
				laneCoord,
				outgoingLaneCoords,
				incomingDirection ===
				outgoingDirection
			);

			if ( !link ) continue;

			connection.addLaneLink( link );
		}

	}

	createNonDrivingLinks ( connection: TvJunctionConnection ): TvJunctionConnection {

		function computeS ( lane: TvLane, contact: TvContactPoint ): number {

			if ( contact == TvContactPoint.START ) {

				return 0;

			} else if ( contact == TvContactPoint.END ) {

				return lane.laneSection.road.length;

			}

		}

		const incomingContact = connection.connectingRoad.predecessor.contactPoint;
		const outgoingContact = connection.connectingRoad.successor.contactPoint;

		const incomingDirection = this.determineDirection( incomingContact );
		let outgoingDirection = TravelDirection.forward;

		if ( incomingContact != outgoingContact ) {

			outgoingDirection = incomingDirection;

		} else {

			if ( incomingDirection === TravelDirection.forward ) {


				outgoingDirection = TravelDirection.backward;

			} else {

				outgoingDirection = TravelDirection.forward;

			}

		}

		const incomingCoords = connection.getIncomingLanes()
			.filter( lane => lane.type != TvLaneType.driving )
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => new TvLaneCoord( lane.laneSection.road, lane.laneSection, lane, computeS( lane, incomingContact ), 0 ) );

		const outgoingCoords = connection.getOutgoingLanes()
			.filter( lane => lane.type != TvLaneType.driving )
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => new TvLaneCoord( lane.laneSection.road, lane.laneSection, lane, computeS( lane, outgoingContact ), 0 ) );

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incomingCoord = incomingCoords[ i ];

			const link = this.createLink( connection, incomingCoord, outgoingCoords, incomingDirection === outgoingDirection, true );

			if ( !link ) continue;

			connection.addLaneLink( link );

		}

		return connection;
	}

	addRoadMarks ( connection: TvJunctionConnection ): TvJunctionConnection {

		connection.connectingRoad.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				if ( lane.side == TvLaneSide.CENTER ) return;

				const previousLaneId = lane.predecessorId || lane.id;

				const previousLane = connection.incomingRoad.getLastLaneSection().getLaneById( previousLaneId );

				if ( previousLane ) {

					const lastRoadMark = previousLane.roadMarks[ previousLane.roadMarks.size - 1 ];

					if ( lastRoadMark ) {
						lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
					}

				}

			} );

		} );

		// TODO: test and
		return;

		function computeS ( lane: TvLane, contact: TvContactPoint ): number {

			if ( contact == TvContactPoint.START ) {

				return 0;

			} else if ( contact == TvContactPoint.END ) {

				return lane.laneSection.road.length;

			}

		}

		const incomingContact = connection.connectingRoad.predecessor.contactPoint;
		const outgoingContact = connection.connectingRoad.successor.contactPoint;

		const incomingDirection = this.determineDirection( incomingContact );
		const outgoingDirection = this.determineDirection( outgoingContact );

		const incomingCoords = connection.getIncomingLanes()
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => new TvLaneCoord( lane.laneSection.road, lane.laneSection, lane, computeS( lane, incomingContact ), 0 ) );

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incoming = incomingCoords[ i ];

			const roadmark = incoming.lane.getRoadMarkAt( incoming.s );

			const laneLink = connection.laneLink.find( link => link.incomingLane === incoming.lane );

			if ( roadmark && laneLink ) {
				laneLink.connectingLane.addRoadMarkInstance( roadmark.clone( 0 ) );
			}

		}

		return connection;
	}

	private createLink (
		connection: TvJunctionConnection,
		incoming: TvLaneCoord,
		outgoingLanes: TvLaneCoord[],
		sameDirection = true,
		nonDriving = false
	) {

		const roadLength = connection.connectingRoad.length;

		let outgoing: TvLaneCoord;

		const outgoingLane = TvLaneSection.getNearestLane( outgoingLanes.map( i => i.lane ), incoming.lane );

		if ( !outgoingLane ) return;

		outgoing = outgoingLanes.find( i => i.lane === outgoingLane );

		if ( !outgoing ) return;

		const newLaneId = -Math.abs( incoming.lane.id );

		// avoids adding the same lane twice
		if ( connection.connectingLaneSection.hasLaneId( newLaneId ) ) return;

		const connectionLane = connection.connectingLaneSection.addLane(
			TvLaneSide.RIGHT,
			newLaneId,
			incoming.lane.type,
			incoming.lane.level,
			true
		);

		connectionLane.predecessorId = incoming.lane.id;
		connectionLane.successorId = outgoing.lane.id;

		// NOTE: THIS CAN probably be added in road event listener also
		const widhtAtStart = incoming.lane.getWidthValue( incoming.s );
		const widthAtEnd = outgoing.lane.getWidthValue( outgoing.s );
		connectionLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );
		connectionLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );
		TvUtils.computeCoefficients( connectionLane.width, roadLength );

		return this.createLaneLink( incoming.lane, connectionLane );

	}

	private createLaneLink ( from: TvLane, to: TvLane ) {

		return new TvJunctionLaneLink( from, to );

	}

	// Method to determine the outgoing direction, needs to be implemented
	determineDirection ( contact: TvContactPoint ): TravelDirection {

		if ( contact == TvContactPoint.END ) {
			return TravelDirection.forward;
		}

		return TravelDirection.backward;
	}

	determineOutgoingDirection ( incoming: TvRoadCoord, outgoing: TvRoadCoord ): TravelDirection {

		if ( incoming.contact != outgoing.contact ) {

			return incoming.travelDirection;

		}

		if ( incoming.travelDirection === TravelDirection.forward ) {

			return TravelDirection.backward;

		}

		return TravelDirection.forward;

	}

}
