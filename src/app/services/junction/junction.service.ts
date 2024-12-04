/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Object3D, Vector3 } from 'three';
import { MapService } from '../map/map.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { MapEvents } from 'app/events/map-events';
import { JunctionRemovedEvent } from 'app/events/junction/junction-removed-event';
import { JunctionCreatedEvent } from 'app/events/junction/junction-created-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TvJunctionBoundaryService } from 'app/map/junction-boundary/tv-junction-boundary.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseDataService<TvJunction> {

	constructor (
		private factory: JunctionFactory,
		private mapService: MapService,
		private boundaryService: TvJunctionBoundaryService,
	) {
		super();
	}

	get junctions () {

		return this.mapService.map.getJunctions();

	}

	getJunctionById ( id: number ): any {

		return this.mapService.map.getJunction( id );

	}

	fireCreatedEvent ( junction: TvJunction ): void {

		MapEvents.junctionCreated.emit( new JunctionCreatedEvent( junction ) );

	}

	fireRemovedEvent ( junction: TvJunction ): void {

		MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction ) );

	}

	updateJunctionMeshAndBoundary ( junction: TvJunction ): void {

		this.boundaryService.update( junction );

		MapEvents.makeMesh.emit( junction );

		junction.updatePositionAndBounds();

	}

	createNewJunction (): any {

		return this.factory.createByType();

	}



	addConnectionsFromContact (
		junction: TvJunction,
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {


		return junction;
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
