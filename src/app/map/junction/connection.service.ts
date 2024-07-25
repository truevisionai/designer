import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { RoadService } from '../../services/road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionService {

	constructor ( private roadService: RoadService ) { }

	removeLink ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		connection.laneLink = connection.laneLink.filter( l => l !== link );

		if ( connection.laneLink.length === 0 ) {

			junction.connections.delete( connection.id );

			this.roadService.remove( connection.connectingRoad );

		}

	}

}
