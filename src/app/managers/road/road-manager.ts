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

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private roadObjectService: RoadObjectService,
		private roadElevationManager: RoadElevationManager,
		private laneManager: LaneManager,
		private roadBuilder: RoadBuilder,
		private splineBuilder: SplineBuilder,
		private roadLinkManager: RoadLinkManager,
		private splineService: SplineService,
	) {
	}

	addRoad ( road: TvRoad ) {

		this.roadLinkManager.onRoadCreated( road );

		for ( const laneSection of road.laneSections ) {
			for ( const [ id, lane ] of laneSection.lanes ) {
				this.laneManager.onLaneCreated( lane );
			}
		}

		this.roadElevationManager.onRoadCreated( road );

		this.mapService.setRoadOpacity( road );

		if ( road.spline?.geometries.length == 0 ) {
			this.splineService.update( road.spline );
		}

		this.rebuildRoad( road );

		this.mapService.map.addSpline( road.spline );

		if ( road.gameObject ) {
			this.mapService.map.gameObject.add( road.gameObject );
		}

	}

	removeRoad ( road: TvRoad ) {

		this.roadLinkManager.onRoadRemoved( road );

		if ( road.isJunction ) {

			this.mapService.map.removeSpline( road.spline );

			road.junction?.removeConnectingRoad( road );

		} else if ( this.splineService.hasSegment( road.spline, road ) ) {

			road.spline.segmentMap.remove( road );

		}

		if ( road.spline.segmentMap.length == 0 ) {

		} else {

			this.splineBuilder.buildSpline( road.spline );

		}

		road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( road, object );

		} );

		this.mapService.map.gameObject.remove( road.gameObject );

		this.mapService.map.removeRoad( road );

	}

	updateRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadElevationManager.onRoadUpdated( road );

		this.rebuildRoad( road );

		this.buildLinks( road );

		this.updateRoadObjects( road );

		this.mapService.setRoadOpacity( road );

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

	private rebuildRoad ( road: TvRoad ) {

		if ( road.gameObject ) {

			this.mapService.map.gameObject.remove( road.gameObject );

			// try to remove from both places
			SceneService.removeFromMain( road.gameObject );

		}

		this.roadBuilder.rebuildRoad( road, this.mapService.map );
	}

}
