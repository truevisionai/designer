/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { Vector3 } from 'three';
import { MapService } from '../map/map.service';
import { MapEvents } from 'app/events/map-events';
import { JunctionRemovedEvent } from 'app/events/junction/junction-removed-event';
import { JunctionCreatedEvent } from 'app/events/junction/junction-created-event';
import { BaseDataService } from "../../core/interfaces/data.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseDataService<TvJunction> {

	constructor (
		private factory: JunctionFactory,
		private mapService: MapService,
	) {
		super();
	}

	get junctions () {

		return this.mapService.map.getJunctions();

	}

	fireCreatedEvent ( junction: TvJunction ): void {

		MapEvents.junctionCreated.emit( new JunctionCreatedEvent( junction ) );

	}

	fireRemovedEvent ( junction: TvJunction ): void {

		MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction ) );

	}

	updateJunctionMeshAndBoundary ( junction: TvJunction ): void {

		junction.updateBoundary();

		MapEvents.makeMesh.emit( junction );

		junction.updatePositionAndBounds();

	}

	add ( object: TvJunction ): void {

		this.fireCreatedEvent( object );

	}

	all (): TvJunction[] {

		return this.junctions;

	}

	remove ( object: TvJunction ): void {

		this.fireRemovedEvent( object );

	}

	update ( object: TvJunction ): void {

		MapEvents.junctionUpdated.emit( object );

	}

	getNearestJunction ( target: Vector3, maxDistance: number = 10 ): TvJunction | undefined {

		let nearestJunction: TvJunction | undefined;
		let nearestDistance = maxDistance;

		for ( const junction of this.mapService.map.getJunctions() ) {

			const distance = junction.centroid?.distanceTo( target ) ?? Number.MAX_SAFE_INTEGER;

			if ( distance <= nearestDistance ) {
				nearestJunction = junction;
				nearestDistance = distance;
			}

		}

		return nearestJunction;

	}

}
