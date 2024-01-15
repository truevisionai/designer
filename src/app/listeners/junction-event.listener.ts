import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { JunctionCreatedEvent } from "../events/junction/junction-created-event";
import { JunctionUpdatedEvent } from "../events/junction/junction-updated-event";
import { JunctionRemovedEvent } from "../events/junction/junction-removed-event";
import { JunctionManager } from "app/managers/junction-manager";
import { Environment } from "app/core/utils/environment";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionEventListener {

	private debug = Environment.production;

	constructor (
		private junctionManager: JunctionManager,
	) {
	}

	init () {

		MapEvents.junctionCreated.subscribe( e => this.onJunctionCreated( e ) );
		MapEvents.junctionRemoved.subscribe( e => this.onJunctionRemoved( e ) );
		MapEvents.junctionUpdated.subscribe( e => this.onJunctionUpdated( e ) );

	}

	onJunctionCreated ( e: JunctionCreatedEvent ): void {

		if ( this.debug ) console.trace( e );

		this.junctionManager.addJunction( e.junction );

	}

	onJunctionRemoved ( event: JunctionRemovedEvent ): void {

		if ( this.debug ) console.trace( event );

		this.junctionManager.removeJunction( event.junction );

	}

	onJunctionUpdated ( e: JunctionUpdatedEvent ): void {

		if ( this.debug ) console.debug( e );

	}

}
