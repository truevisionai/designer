import { Injectable } from "@angular/core";
import { TvJunctionConnection } from "app/modules/tv-map/models/junctions/tv-junction-connection";
import { TvLaneCoord } from "app/modules/tv-map/models/tv-lane-coord";
import { SplineFactory } from "app/services/spline/spline.factory";
import { RoadFactory } from "./road-factory.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvContactPoint, TvLaneSide, TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { LaneLinkService } from "app/services/junction/lane-link.service";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionConnectionFactory {

	constructor (
		private splineFactory: SplineFactory,
		private roadFactory: RoadFactory,
		private laneLinkService: LaneLinkService,
	) { }

	createConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		const incomingDirection = this.laneLinkService.determineDirection( incoming.contact );
		const incomingCoords = incoming.laneSection.getLaneArray().filter( lane => lane.direction === incomingDirection ).map( lane => incoming.toLaneCoord( lane ) );

		const outgoingDirection = this.laneLinkService.determineOutgoingDirection( incoming, outgoing );
		const outgoingCoords = outgoing.laneSection.getLaneArray().filter( lane => lane.direction === outgoingDirection ).map( lane => outgoing.toLaneCoord( lane ) );

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incomingCoord = incomingCoords[ i ];

			const outgoingCoord = TvLaneSection.getNearestLane( outgoingCoords.map( i => i.lane ), incomingCoord.lane );

			if ( !outgoingCoord ) continue;

			const outgoingLane = outgoingCoords.find( i => i.lane === outgoingCoord );

			if ( !outgoingLane ) continue;

			const connection = this.createConnection( junction, incomingCoord, outgoingLane );

			connections.push( connection );

		}

		return connections;

	}

	createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection {

		const road = this.roadFactory.createConnectingRoad( junction, incoming, outgoing );

		const laneSection = road.addGetLaneSection( 0 );

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const maneueverLane = laneSection.addLane( TvLaneSide.RIGHT, -1, incoming.lane.type, false, false );

		maneueverLane.setPredecessor( incoming.laneId );

		maneueverLane.setSuccessor( outgoing.laneId );

		road.spline = this.splineFactory.createManeuverSpline( incoming, outgoing );

		road.spline.addRoadSegment( 0, road );

		return this.createConnectionInstance( junction, road, incoming.road, outgoing.road );

	}

	private createConnectionInstance ( junction: TvJunction, connectingRoad: TvRoad, incoming: TvRoad, outgoing: TvRoad ) {

		return new TvJunctionConnection( junction.connections.size, incoming, connectingRoad, TvContactPoint.START, outgoing );

	}

}
