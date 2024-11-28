/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PlayerService, PlayerUpdateData } from 'app/core/player.service';
import { Time } from 'app/core/time';
import { MapEvents, } from 'app/events/map-events';
import { ScenarioDirectorService } from 'app/scenario/services/scenario-director.service';
import { ScenarioService } from 'app/scenario/services/scenario.service';
import { EntityService } from 'app/scenario/entity/entity.service';
import { TvLaneType } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from 'app/services/road/road.service';
import { Maths } from 'app/utils/maths';

@Injectable( {
	providedIn: 'root'
} )
export class TrafficManager {

	public disabled = true;

	private createdId: any = null;
	private updatedId: any = null;
	private readonly debounceDuration = 100; // duration in milliseconds

	constructor (
		private playerService: PlayerService,
		private roadService: RoadService,
		private vehicleService: EntityService,
		private scenarioService: ScenarioService,
		private scenarioDirector: ScenarioDirectorService
	) { }

	init () {

		if ( this.disabled ) return;

		MapEvents.roadCreated.subscribe( ( e ) => {

			// If there's a pending execution, cancel it
			if ( this.createdId ) clearTimeout( this.createdId );

			// Schedule a new execution
			this.createdId = setTimeout( () => {

				this.restart();

			}, this.debounceDuration );

		} );

		MapEvents.roadUpdated.subscribe( ( e ) => {

			// If there's a pending execution, cancel it
			if ( this.updatedId ) clearTimeout( this.updatedId );

			// Schedule a new execution
			this.updatedId = setTimeout( () => {

				this.restart();

			}, this.debounceDuration );

		} );



		this.playerService.playerTick.subscribe( e => this.onPlayerTick( e ) );
	}

	restart () {

		if ( this.disabled ) return;

		this.restartTraffic();

		if ( !this.playerService.playing ) {
			setInterval( () => this.playerService.tick(), 20 )
		}

	}

	restartTraffic () {

		// for ( const vehicle of this.vehicleService.getVehicles() ) {
		// 	this.scenarioService.getScenario().removeObject( vehicle );
		// }
		this.vehicleService.removeAll();

		this.roadService.roads
			.filter( road => road.spline.controlPoints.length >= 2 )
			.filter( road => road.geometries.length > 0 )
			.filter( road => !road.isJunction )
			.forEach( road => {
				this.createTraffic( road );
			} )

	}

	createTraffic ( road: TvRoad ) {

		for ( let i = 0; i < road.laneSections.length; i++ ) {

			const laneSection = road.laneSections[ i ];

			const lanes = laneSection.getLanes();

			for ( let j = 0; j < lanes.length; j++ ) {

				const lane = lanes[ j ];

				if ( lane.type === TvLaneType.driving && lane.id != 0 ) {

					const randomCount = Maths.randomNumberBetween( 1, 5 );

					for ( let k = 0; k < randomCount; k++ ) {

						const s = Math.random() * road.length;

						const vehicle = this.vehicleService.createVehicleOnLane( road, lane, s, 0 );


					}

				}

			}

		}

	}

	onPlayerTick ( e: PlayerUpdateData ): void {

		if ( this.disabled ) return;

	}

}
