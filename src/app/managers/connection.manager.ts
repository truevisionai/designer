/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { LaneSectionFactory } from 'app/factories/lane-section.factory';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadManager } from './road/road-manager';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionManager {

	constructor (
		private laneSectionFactory: LaneSectionFactory,
		private roadManager: RoadManager,
	) { }

	onConnectionCreated ( connection: TvJunctionConnection ) {

		this.createLaneSections( connection, connection.connectingRoad );

		this.roadManager.addRoad( connection.connectingRoad );

	}

	createLaneSections ( connection: TvJunctionConnection, connectingRoad: TvRoad ) {

		const incoming = connection.incomingRoad.getRoadCoordByContact( connection.getIncomingContactPoint() );

		const outgoing = connection.outgoingRoad.getRoadCoordByContact( connection.getOutgoingContactPoint() );

		const laneSections = this.laneSectionFactory.createForConnectingRoad( connectingRoad, incoming, outgoing );

		for ( let i = 0; i < laneSections.length; i++ ) {

			connectingRoad.addLaneSectionInstance( laneSections[ i ] );

		}

		const firstLaneSection = connectingRoad.getFirstLaneSection();

		if ( !firstLaneSection.areLeftLanesInOrder() || !firstLaneSection.areRightLanesInOrder() ) {
			console.error( 'Lane order is not correct', firstLaneSection.getLaneArray() );
		}

		// connectingRoad.getFirstLaneSection().getLaneArray().filter( lane => lane.id ).forEach( connectingLane => {
		// 	connection.addLaneLinks( incomingLane, connectingLane );
		// } )

	}

}
