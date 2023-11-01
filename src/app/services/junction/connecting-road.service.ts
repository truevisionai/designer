import { Injectable } from '@angular/core';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseService } from '../base.service';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectingRoadService extends BaseService {

	createConnectingRoad ( junction: TvJunction, incomingRoad: TvRoad, outgoingRoad: TvRoad ): TvRoad {

		// create

		return;
	}

	removeConnectionRoad ( junction: TvJunction, road: TvRoad ): void {

		junction.connections.forEach( connection => {

			if ( connection.connectingRoadId === road.id ) {

				junction.connections.delete( connection.id );

			}

		} );

		this.map.deleteRoad( road );

	}

}
