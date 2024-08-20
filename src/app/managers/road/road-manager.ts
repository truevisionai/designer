/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { RoadElevationManager } from "./road-elevation.manager";
import { LaneManager } from "../lane/lane.manager";
import { RoadBuilder } from "app/map/builders/road.builder";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { RoadLinkManager } from "./road-link.manager";
import { SceneService } from "app/services/scene.service";
import { SplineService } from "../../services/spline/spline.service";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoadLink } from "app/map/models/tv-road-link";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Log } from "app/core/utils/log";
import { RoadFixerService } from "./road-fixer.service";
import { LinkUtils } from "app/utils/link.utils";

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
		private roadBuilder: RoadBuilder,
		private splineBuilder: SplineBuilder,
		private roadLinkManager: RoadLinkManager,
		private splineService: SplineService,
		private roadFixerService: RoadFixerService
	) {
	}

	addRoad ( road: TvRoad ) {

		if ( this.debug ) Log.debug( 'Add', road.toString() );

		this.roadLinkManager.onRoadCreated( road );

		this.roadFixerService.fix( road );

		for ( const laneSection of road.laneSections ) {
			for ( const [ id, lane ] of laneSection.lanesMap ) {
				this.laneManager.onLaneCreated( lane );
			}
		}

		LinkUtils.updateLaneUuidLinks( road );

		this.roadElevationManager.onRoadCreated( road );

		this.mapService.setRoadOpacity( road );

		if ( road.spline?.geometries.length == 0 ) {
			this.splineService.update( road.spline );
		}

		this.rebuildRoad( road );

		if ( !this.mapService.hasSpline( road.spline ) ) {

			this.mapService.addSpline( road.spline );

		} else {

			Log.warn( 'Spline already exists', road.spline.toString() );

		}

		if ( road.gameObject ) {

			this.mapService.map.gameObject.add( road.gameObject );

		}

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

		this.removeMesh( road );

	}

	removeMesh ( road: TvRoad ) {

		road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( road, object );

		} );

		this.mapService.map.gameObject.remove( road.gameObject );

		if ( this.mapService.hasRoad( road ) ) {

			this.mapService.map.removeRoad( road );

		} else {

			Log.error( 'Road not found in map', road.toString() );

		}

	}

	updateRoad ( road: TvRoad ) {

		if ( this.debug ) Log.debug( 'Update', road.toString() );

		this.roadFixerService.fix( road );

		this.mapService.map.gameObject.remove( road.gameObject );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadElevationManager.onRoadUpdated( road );

		this.rebuildRoad( road );

		this.buildLinks( road );

		this.updateRoadObjects( road );

		this.mapService.setRoadOpacity( road );

		LinkUtils.updateLaneUuidLinks( road );
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

		if ( road.gameObject ) {

			this.mapService.map.gameObject.remove( road.gameObject );

			// try to remove from both places
			SceneService.removeFromMain( road.gameObject );

		}

		try {

			this.roadBuilder.rebuildRoad( road, this.mapService.map );

		} catch ( error ) {

			Log.error( 'Rebuild road failed', road.toString() );

			Log.error( error );

			this.removeRoad( road );

		}

	}

	private removeLinks ( removedRoad: TvRoad ) {

		if ( removedRoad.isJunction ) return;

		const processLink = ( link: TvRoadLink ) => {

			if ( link.isRoad ) {

				const road = link.element as TvRoad;

				if ( link.contactPoint === TvContactPoint.START ) {

					road.predecessor = removedRoad.successor?.clone();

				} else {

					road.successor = removedRoad.successor?.clone();

				}

			} else if ( link.isJunction ) {

				// if the road is connected to a junction, remove the road from the junction
				const junction = link.element as TvJunction;
				const connections = junction.getConnections().filter( connection => connection.incomingRoad === removedRoad );
				connections.forEach( connection => this.removeRoad( connection.connectingRoad ) );

			}

		}

		if ( removedRoad.predecessor ) processLink( removedRoad.predecessor );

		if ( removedRoad.successor ) processLink( removedRoad.successor );

	}
}
