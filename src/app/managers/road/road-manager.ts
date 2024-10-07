/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { RoadElevationManager } from "./road-elevation.manager";
import { LaneManager } from "../lane/lane.manager";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";
import { RoadLinkManager } from "./road-link.manager";
import { SplineService } from "../../services/spline/spline.service";
import { Log } from "app/core/utils/log";
import { RoadValidator } from "./road-validator";
import { LinkUtils } from "app/utils/link.utils";
import { MapEvents } from "app/events/map-events";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	private debug = true;

	constructor (
		private mapService: MapService,
		private roadObjectService: RoadObjectService,
		private roadElevationManager: RoadElevationManager,
		private laneManager: LaneManager,
		private splineBuilder: SplineGeometryGenerator,
		private roadLinkManager: RoadLinkManager,
		private splineService: SplineService,
		private roadValidator: RoadValidator
	) {
	}

	addRoad ( road: TvRoad ) {

		if ( this.debug ) Log.debug( 'Add', road.toString() );

		this.roadLinkManager.onRoadCreated( road );

		for ( const laneSection of road.laneSections ) {
			for ( const [ id, lane ] of laneSection.lanesMap ) {
				this.laneManager.onLaneCreated( lane );
			}
		}

		LinkUtils.updateLaneUuidLinks( road );

		this.roadElevationManager.onRoadCreated( road );

		this.mapService.setRoadOpacity( road );

		if ( road.spline?.getGeometryCount() == 0 ) {
			this.splineService.update( road.spline );
		}

		this.rebuildRoad( road );

		if ( !this.mapService.hasSpline( road.spline ) ) {

			this.mapService.addSpline( road.spline );

		} else {

			Log.warn( 'Spline already exists', road.spline.toString() );

		}

		this.roadValidator.validateRoad( road );

	}

	removeRoad ( road: TvRoad ) {

		if ( this.debug ) Log.debug( 'Remove', road.toString() );

		this.roadLinkManager.onRoadRemoved( road );

		// alternative to roadLinkManager
		// this.removeLinks( road );

		if ( !road.spline ) {
			Log.error( 'Road has no spline', road.toString() );
			return;
		}

		if ( road.isJunction ) {

			if ( this.mapService.map.hasSpline( road.spline ) ) {

				this.mapService.map.removeSpline( road.spline );

			} else {

				Log.warn( 'Spline already removed', road.spline.toString() );

			}

		} else {

			road.spline?.segmentMap.remove( road );

		}

		if ( !road.isJunction && road.spline?.segmentMap.length > 0 ) {

			this.splineBuilder.buildSpline( road.spline );

		}

		if ( this.mapService.hasRoad( road ) ) {

			this.mapService.map.removeRoad( road );

		} else {

			Log.error( 'Road not found in map', road.toString() );

		}

	}

	// removeMesh ( road: TvRoad ) {

	// 	road.getRoadObjects().forEach( object => {

	// 		this.roadObjectService.removeObject3d( road, object );

	// 	} );

	// 	this.mapService.map.gameObject.remove( road.gameObject );

	// }

	updateRoad ( road: TvRoad ) {

		if ( this.debug ) Log.debug( 'Update', road.toString() );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadElevationManager.onRoadUpdated( road );

		this.rebuildRoad( road );

		this.buildLinks( road );

		this.updateRoadObjects( road );

		this.mapService.setRoadOpacity( road );

		LinkUtils.updateLaneUuidLinks( road );

		this.roadValidator.validateRoad( road );
	}

	private updateRoadObjects ( road: TvRoad ): void {

		this.roadObjectService.updateRoadObjectPositions( road );

	}

	private buildLinks ( road: TvRoad ) {

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			// if ( road.spline == successor.spline ) return;

			this.rebuildRoad( successor );

		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			// if ( road.spline == predecessor.spline ) return;

			this.rebuildRoad( predecessor );

		}
	}

	private rebuildRoad ( road: TvRoad ): void {

		try {

			MapEvents.makeMesh.emit( road );

		} catch ( error ) {

			Log.error( 'Rebuild road failed', road.toString() );

			Log.error( error );

			this.removeRoad( road );

		}

	}

	private removeLinks ( removedRoad: TvRoad ) {

		if ( removedRoad.isJunction ) return;

		removedRoad.removeLinks();

	}
}
