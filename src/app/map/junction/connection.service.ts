/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { RoadService } from '../../services/road/road.service';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionService {

	constructor ( private roadService: RoadService ) { }

	addConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		if ( junction.hasConnection( connection ) ) {
			Log.error( 'Connection already exists', connection?.toString() );
			return;
		}

		junction.addConnection( connection );

		this.roadService.add( connection.connectingRoad );

	}

	removeConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		if ( !junction.hasConnection( connection ) ) {
			Log.error( 'Connection does not exist', connection?.toString() );
			return;
		}

		junction.removeConnection( connection );

	}

	addLink ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		if ( !junction.hasConnection( connection ) ) {
			this.addConnection( junction, connection );
		}

		connection.laneLink.push( link );

	}

	removeLink ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		connection.laneLink = connection.laneLink.filter( l => l !== link );

		if ( connection.laneLink.length === 0 ) {
			this.removeConnection( junction, connection );
		}

	}

}
