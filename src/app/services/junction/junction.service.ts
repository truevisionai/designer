/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Object3D } from 'three';
import { JunctionBuilder } from './junction.builder';
import { DepConnectionFactory } from "../../map/junction/dep-connection.factory";
import { MapService } from '../map/map.service';
import { Object3DMap } from 'app/core/models/object3d-map';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { MapEvents } from 'app/events/map-events';
import { JunctionRemovedEvent } from 'app/events/junction/junction-removed-event';
import { JunctionCreatedEvent } from 'app/events/junction/junction-created-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { RoadGeometryService } from "../road/road-geometry.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseDataService<TvJunction> {

	private objectMap = new Object3DMap<TvJunction, Object3D>();

	constructor (
		private factory: JunctionFactory,
		private junctionBuilder: JunctionBuilder,
		private connectionService: DepConnectionFactory,
		private mapService: MapService,
	) {
		super();
	}

	get junctions () {

		return this.mapService.map.getJunctions();

	}

	getJunctionById ( id: number ) {

		return this.mapService.map.getJunctionById( id );

	}

	addJunction ( junction: TvJunction ) {

		MapEvents.junctionCreated.emit( new JunctionCreatedEvent( junction ) );

	}

	removeJunction ( junction: TvJunction ) {

		MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction ) );

	}

	removeJunctionMesh ( junction: TvJunction ) {

		this.objectMap.remove( junction );

	}

	createNewJunction () {

		return this.factory.createJunction();

	}

	createJunctionFromContact (
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const junction = this.factory.createJunction();

		this.addConnectionsFromContact( junction, roadA, contactA, roadB, contactB );

		return junction;
	}

	addConnectionsFromContact (
		junction: TvJunction,
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const coordA = RoadGeometryService.instance.findContactCoord( roadA, contactA );
		const coordB = RoadGeometryService.instance.findContactCoord( roadB, contactB );

		this.setLink( roadA, contactA, junction );
		this.setLink( roadB, contactB, junction );

		const connectionA = this.connectionService.createConnection( junction, coordA, coordB );
		junction.addConnection( connectionA );

		const connectionB = this.connectionService.createConnection( junction, coordB, coordA );
		junction.addConnection( connectionB );

		return junction;
	}

	setLink ( road: TvRoad, contact: TvContactPoint, junction: TvJunction ) {

		if ( contact == TvContactPoint.START ) {

			road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		} else if ( contact == TvContactPoint.END ) {

			road.setSuccessor( TvRoadLinkType.JUNCTION, junction );

		}

	}
	add ( object: TvJunction ): void {

		this.addJunction( object );

	}

	all (): TvJunction[] {

		return this.junctions;

	}

	remove ( object: TvJunction ): void {

		this.removeJunction( object );

	}

	update ( object: TvJunction ): void {

		// this.createJunctionMesh( object );

	}

}
