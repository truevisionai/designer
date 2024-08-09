import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionLinkService {

	constructor () { }

	replaceIncomingRoad ( junction: TvJunction, oldIncomingRoad: TvRoad, newIncomingRoad: TvRoad, contact: TvContactPoint ) {

		for ( const connection of junction.getConnections() ) {

			if ( connection.incomingRoad == oldIncomingRoad ) {

				connection.incomingRoad = newIncomingRoad;

			}

			if ( connection.connectingRoad.predecessor?.element == oldIncomingRoad ) {

				connection.connectingRoad.setPredecessorRoad( newIncomingRoad, contact );

			}

			if ( connection.connectingRoad.successor?.element == oldIncomingRoad ) {

				connection.connectingRoad.setSuccessorRoad( newIncomingRoad, contact );

			}

		}

	}

}
