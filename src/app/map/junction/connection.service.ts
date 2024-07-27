import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { RoadService } from '../../services/road/road.service';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionService {

	constructor ( private roadService: RoadService ) { }

	addConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		if ( junction.connections.has( connection.id ) ) {
			Log.error( 'Connection already exists', connection );
			return;
		}

		junction.connections.set( connection.id, connection );

		this.roadService.add( connection.connectingRoad );

	}

	removeConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		if ( !junction.connections.has( connection.id ) ) {
			Log.error( 'Connection does not exist', connection );
			return;
		}

		junction.connections.delete( connection.id );

		this.roadService.remove( connection.connectingRoad );

	}

	addLink ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		if ( !junction.connections.has( connection.id ) ) {
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
