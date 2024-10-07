/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { JunctionCreatedEvent } from "../events/junction/junction-created-event";
import { JunctionRemovedEvent } from "../events/junction/junction-removed-event";
import { JunctionManager } from "app/managers/junction-manager";
import { Environment } from "app/core/utils/environment";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { MapService } from "app/services/map/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionEventListener {

	private debug = Environment.production;

	constructor (
		private junctionManager: JunctionManager,
		private mapService: MapService,
	) {
	}

	init () {

		MapEvents.junctionCreated.subscribe( e => this.onJunctionCreated( e ) );
		MapEvents.junctionRemoved.subscribe( e => this.onJunctionRemoved( e ) );
		MapEvents.junctionUpdated.subscribe( e => this.onJunctionUpdated( e ) );

	}

	onJunctionUpdated ( junction: TvJunction ): void {

		const splines = junction.getIncomingSplines();

		if ( splines.length <= 1 ) {

			this.junctionManager.removeJunction( junction );

		} else {

			this.junctionManager.updateJunction( junction );

		}

	}

	removeJunction ( junction: TvJunction ): void {

		const incomingSplines = junction.getIncomingSplines();

		this.removeConnectionRoadAndSplines( junction );

		this.mapService.removeJunction( junction );

		MapEvents.removeMesh.emit( junction );

		incomingSplines.forEach( spline => {

			spline.removeSegment( junction );

			MapEvents.splineSegmentRemoved.emit( { spline } );

		} );

	}

	removeConnectionRoadAndSplines ( junction: TvJunction ): void {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			MapEvents.splineRemoved.emit( { spline: connection.getSpline() } );

		}

	}

	onJunctionCreated ( e: JunctionCreatedEvent ): void {

		this.junctionManager.addJunction( e.junction );

	}

	onJunctionRemoved ( event: JunctionRemovedEvent ): void {

		this.junctionManager.removeJunction( event.junction );

	}

}
