import { Injectable } from '@angular/core';
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';

@Injectable( {
	providedIn: 'root'
} )
export class LaneLinkService {

	constructor () { }

	createLaneLinks ( connection: TvJunctionConnection ) {

		console.error( 'Method not implemented.' );

		// connection.incomingRoad
		// connection.connectingRoad

		// const incomingLanes = connection.incomingRoad;

	}

	createLaneLink ( from: TvLane, to: TvLane ) {

		return new TvJunctionLaneLink( from, to );

	}

	createLaneLinkMesh ( from: TvLane, to: TvLane ) {

		console.error( "Method not implemented." );

	}
}
