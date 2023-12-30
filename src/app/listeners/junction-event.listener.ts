import {
	MapEvents
} from "../events/map-events";
import { Injectable } from "@angular/core";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { JunctionService } from "app/services/junction/junction.service";
import { RoadService } from "app/services/road/road.service";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { JunctionCreatedEvent } from "../events/junction/junction-created-event";
import { JunctionUpdatedEvent } from "../events/junction/junction-updated-event";
import { JunctionRemovedEvent } from "../events/junction/junction-removed-event";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionEventListener {

	private debug = true;

	constructor (
		private junctionService: JunctionService,
		private roadService: RoadService,
	) {

	}

	init () {

		MapEvents.junctionCreated.subscribe( e => this.onJunctionCreated( e ) );
		MapEvents.junctionRemoved.subscribe( e => this.onJunctionRemoved( e ) );
		MapEvents.junctionUpdated.subscribe( e => this.onJunctionUpdated( e ) );

	}

	onJunctionCreated ( e: JunctionCreatedEvent ): void {

		if ( this.debug ) console.debug( e );

	}

	onJunctionRemoved ( e: JunctionRemovedEvent ): void {

		if ( this.debug ) console.debug( e );

		this.removeJunctionLinks( e.junction );

		this.junctionService.removeJunction( e.junction );

		e.junction.connections.forEach( connection => {

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( connection.connectingRoad ) );

		} );
	}

	onJunctionUpdated ( e: JunctionUpdatedEvent ): void {

		if ( this.debug ) console.debug( e );
	}

	private removeJunctionLinks ( junction: TvJunction ) {

		const incomingRoads = this.roadService.nonJunctionRoads;

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
