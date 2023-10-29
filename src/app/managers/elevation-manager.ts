/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from 'app/events/map-events';
import { RoadElevationNode } from '../modules/three-js/objects/road-elevation-node';
import { TvRoad } from '../modules/tv-map/models/tv-road.model';
import { Manager } from './manager';

export class ElevationManager extends Manager {

	private static _instance = new ElevationManager();
	private debug = true;

	static get instance (): ElevationManager {
		return this._instance;
	}

	constructor () {

		super();

	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );

	}

	onRoadRemoved ( event: RoadRemovedEvent ): void {

		if ( this.debug ) console.log( 'onRoadRemoved', event.road );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ): void {

		if ( this.debug ) console.log( 'onRoadUpdated', event.road );

		this.createDefaultNodes( event.road );

		if ( event.road.elevationProfile.getElevationCount() >= 2 ) {

			event.road.elevationProfile.elevation[ 0 ].s = 0

			event.road.elevationProfile.elevation[ event.road.elevationProfile.elevation.length - 1 ].s = event.road.length

		}

		this.updateNodes( event.road );

	}

	onRoadCreated ( event: RoadCreatedEvent ): void {

		if ( this.debug ) console.log( 'onRoadCreated', event.road );

		this.createDefaultNodes( event.road );

	}

	createDefaultNodes ( road: TvRoad ) {

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng
			const firstNode = road.addElevation( 0, 0, 0, 0, 0 );

			// add elevation at end
			const lastNode = road.addElevation( road.length, 0, 0, 0, 0 );

			firstNode.node = new RoadElevationNode( road, firstNode );

			lastNode.node = new RoadElevationNode( road, lastNode );
		}

	}

	updateNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}
}
