import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { TravelDirection, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';

@Injectable( {
	providedIn: 'root'
} )
export class LaneLinkService {

	constructor () { }

	createLaneLink ( from: TvLane, to: TvLane ) {

		return new TvJunctionLaneLink( from, to );

	}

	createDrivingLinks ( connection: TvJunctionConnection, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		const laneSection = connection.connectingRoad.laneSections[ 0 ];

		const incomingLanes = incoming.laneSection.getLaneArray().filter( lane => lane.direction === TravelDirection.forward );

		const outgoingDirection = incoming.contact !== outgoing.contact ? TravelDirection.forward : TravelDirection.backward;

		const outgoingLanes = outgoing.laneSection.getLaneArray().filter( lane => lane.direction === outgoingDirection );

		for ( let i = 0; i < incomingLanes.length; i++ ) {

			const incomingLane = incomingLanes[ i ];

			if ( incomingLane.type != TvLaneType.driving ) continue;

			const outgoingLane = outgoingLanes.find( outgoingLane => Math.abs( outgoingLane.id ) === Math.abs( incomingLane.id ) );

			const connectionLane = laneSection.addLane(
				incomingLane.side,
				incomingLane.id,
				incomingLane.type,
				incomingLane.level,
				true
			);

			const laneWidth = incomingLane.getWidthValue( incoming.s ) || incomingLane.getWidthValue( 0 );

			connectionLane.addWidthRecord( 0, laneWidth, 0, 0, 0 );

			if ( !outgoingLane ) continue;

			const laneLink = this.createLaneLink( incomingLane, connectionLane );

			connection.addLaneLink( laneLink );

		}

	}

	createNonDrivingLinks ( connection: TvJunctionConnection ) {

		const incomingLanes: TvLane[] = connection.getIncomingLanes();
		const outgoingLanes: TvLane[] = connection.getOutgoingLanes();

		for ( let i = 0; i < incomingLanes.length; i++ ) {

			const incomingLane = incomingLanes[ i ];

			if ( incomingLane.side != TvLaneSide.RIGHT ) continue;

			const outgoingLane = outgoingLanes.find( outgoingLane => Math.abs( outgoingLane.id ) === Math.abs( incomingLane.id ) );

			if ( connection.connectingLaneSection.hasLaneId( incomingLane.id ) ) continue;

			const connectionLane = connection.connectingLaneSection.addLane(
				incomingLane.side,
				incomingLane.id,
				incomingLane.type,
				incomingLane.level,
				true
			);

			const laneWidth = incomingLane.getWidthValue( 0 );

			connectionLane.addWidthRecord( 0, laneWidth, 0, 0, 0 );

			if ( !outgoingLane ) continue;

			const laneLink = this.createLaneLink( incomingLane, connectionLane );

			connection.addLaneLink( laneLink );

		}

		return connection;
	}
}
