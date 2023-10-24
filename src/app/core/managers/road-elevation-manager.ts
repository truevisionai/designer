/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from 'app/events/map-events';
import { RoadElevationNode } from '../../modules/three-js/objects/road-elevation-node';
import { TvElevation } from '../../modules/tv-map/models/tv-elevation';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';

export class RoadElevationManager {

	private static _instance = new RoadElevationManager();
	private debug = true;

	static get instance (): RoadElevationManager {
		return this._instance;
	}

	private constructor () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );

	}

	onRoadRemoved ( road: TvRoad ): void {

		if ( this.debug ) console.log( 'onRoadRemoved', road );

	}

	onRoadUpdated ( road: TvRoad ): void {

		if ( this.debug ) console.log( 'onRoadUpdated', road );

		this.createDefaultNodes( road );

		if ( road.elevationProfile.getElevationCount() >= 2 ) {

			road.elevationProfile.elevation[ 0 ].s = 0

			road.elevationProfile.elevation[ road.elevationProfile.elevation.length - 1 ].s = road.length

		}

		this.updateNodes( road );

	}

	onRoadCreated ( road: TvRoad ): void {

		if ( this.debug ) console.log( 'onRoadCreated', road );

		this.createDefaultNodes( road );

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

	init () {

		// this.onRoadCreated = this.onRoadCreated.bind( this );

	}

	showNodes ( road: TvRoad ) {

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng and end
			road.addElevation( 0, 0, 0, 0, 0 );
			road.addElevation( road.length, 0, 0, 0, 0 );

		}

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.makeNode( road, elevation );

		} );

	}

	updateNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}

	removeNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			if ( elevation.node ) {

				elevation.node.visible = false;

			}

			SceneService.removeFromTool( elevation.node );

		} );

	}

	makeNode ( road: TvRoad, elevation: TvElevation ) {

		if ( elevation.node ) {

			elevation.node.visible = true;

		} else {

			elevation.node = new RoadElevationNode( road, elevation );

		}

		SceneService.addToolObject( elevation.node );

	}

	showElevationNodes ( road: TvRoad ) {

		// this.getElevationProfile().getElevations().forEach( elevation => {

		// 	if ( elevation.node ) {

		// 		elevation.node.visible = true;

		// 	} else {

		// 		elevation.node = new RoadElevationNode( this, elevation );

		// 	}

		// 	SceneService.add( elevation.node );

		// } );

	}

	hideElevationNodes ( road: TvRoad ) {

		// this.getElevationProfile().getElevations().forEach( elevation => {

		// 	if ( elevation.node ) {

		// 		elevation.node.visible = false;

		// 	}

		// 	SceneService.remove( elevation.node );

		// } );

	}
}
