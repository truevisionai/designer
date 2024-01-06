import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { JunctionService } from "app/services/junction/junction.service";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { JunctionCreatedEvent } from "../events/junction/junction-created-event";
import { JunctionUpdatedEvent } from "../events/junction/junction-updated-event";
import { JunctionRemovedEvent } from "../events/junction/junction-removed-event";
import { MapService } from "app/services/map.service";
import { JunctionConnectionService } from "app/services/junction/junction-connection.service";
import { RoadService } from "app/services/road/road.service";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { RoadUpdatedEvent } from "app/events/road/road-updated-event";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionEventListener {

	private debug = true;

	constructor (
		private junctionService: JunctionService,
		private mapService: MapService,
		private connectionService: JunctionConnectionService,
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
	) {

	}

	init () {

		MapEvents.junctionCreated.subscribe( e => this.onJunctionCreated( e ) );
		MapEvents.junctionRemoved.subscribe( e => this.onJunctionRemoved( e ) );
		MapEvents.junctionUpdated.subscribe( e => this.onJunctionUpdated( e ) );

	}

	onJunctionCreated ( e: JunctionCreatedEvent ): void {

		if ( this.debug ) console.debug( e );

		this.junctionService.addJunction( e.junction );

	}

	onJunctionRemoved ( event: JunctionRemovedEvent ): void {

		if ( this.debug ) console.debug( event );

		this.removeJunctionLinks( event.junction );

		const connections = event.junction.getConnections();

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			if ( connection.incomingRoad?.successor ) {
				connection.incomingRoad.successor = null;
			}

			if ( connection.outgoingRoad?.predecessor ) {
				connection.outgoingRoad.predecessor = null;
			}

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( connection.connectingRoad ) );

			// either event above or this
			// this.mapService.map.removeRoad( connection.connectingRoad );
			// this.mapService.map.removeSpline( connection.connectingRoad.spline );
			// this.mapService.map.gameObject.remove( connection.connectingRoad.gameObject );

		}

		this.junctionService.removeJunction( event.junction );

	}

	onJunctionUpdated ( e: JunctionUpdatedEvent ): void {

		if ( this.debug ) console.debug( e );

		const connections = e.junction.getConnections();

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			this.roadSplineService.updateConnectingRoadSpline( connection );

			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( connection.connectingRoad ) );

		}

	}

	private removeJunctionLinks ( junction: TvJunction ) {

		const incomingRoads = this.mapService.nonJunctionRoads;

		for ( let i = 0; i < incomingRoads.length; i++ ) {

			const incomingRoad = incomingRoads[ i ];

			if ( incomingRoad.successor?.isJunction && incomingRoad.successor?.elementId === junction.id ) {

				incomingRoad.successor = null;

			}

			if ( incomingRoad.predecessor?.isJunction && incomingRoad.predecessor?.elementId === junction.id ) {

				incomingRoad.predecessor = null;

			}
		}

	}

}
