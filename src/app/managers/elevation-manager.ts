/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from 'app/events/map-events';
import { Manager } from './manager';
// import { RoadElevationService } from 'app/services/road/road-elevation.service';

export class ElevationManager extends Manager {

	private static _instance = new ElevationManager();
	private debug = false;

	// private elevationService = new RoadElevationService();

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

		if ( event.road.spline.controlPoints.length < 2 ) return;

		// this.elevationService.createDefaultNodes( event.road );

		// if ( event.road.elevationProfile.getElevationCount() >= 2 ) {

		// 	event.road.elevationProfile.elevation[ 0 ].s = 0

		// 	event.road.elevationProfile.elevation[ event.road.elevationProfile.elevation.length - 1 ].s = event.road.length

		// }

		// this.elevationService.updateNodes( event.road );

	}

	onRoadCreated ( event: RoadCreatedEvent ): void {

		if ( this.debug ) console.log( 'onRoadCreated', event.road );

		if ( event.road.spline.controlPoints.length < 2 ) return;

		// this.elevationService.createDefaultNodes( event.road );

	}

}
