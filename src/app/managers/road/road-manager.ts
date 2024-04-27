/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { RoadElevationManager } from "./road-elevation.manager";
import { LaneManager } from "../lane/lane.manager";
import { RoadBuilder } from "app/map/builders/road.builder";
import { SplineSegmentService } from "app/services/spline/spline-segment.service";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { RoadLinkManager } from "./road-link.manager";
import { SceneService } from "app/services/scene.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private roadFactory: RoadFactory,
		private roadObjectService: RoadObjectService,
		private roadElevationManager: RoadElevationManager,
		private laneManager: LaneManager,
		private roadBuilder: RoadBuilder,
		private segmentService: SplineSegmentService,
		private splineBuilder: SplineBuilder,
		private roadLinkManager: RoadLinkManager
	) { }

	addRoad ( road: TvRoad ) {

		this.roadLinkManager.onRoadCreated( road );

		for ( const laneSection of road.laneSections ) {
			for ( const [ id, lane ] of laneSection.lanes ) {
				this.laneManager.onLaneCreated( lane );
			}
		}

		this.roadElevationManager.onRoadCreated( road );

		this.mapService.setRoadOpacity( road );

		this.updateRoadGeometries( road );

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

			road.junctionInstance?.removeConnectingRoad( road );

		} else if ( road.spline.findSegment( road ) ) {

			this.segmentService.removeRoadSegment( road.spline, road );

		}

		if ( road.spline.getSplineSegments().length == 0 ) {

		} else {

			this.splineBuilder.buildSpline( road.spline );

		}

		road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( object );

		} );

		this.mapService.map.gameObject.remove( road.gameObject );

		this.mapService.map.removeRoad( road );

		this.roadFactory.idRemoved( road.id );

	}

	updateRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		this.updateRoadGeometries( road );

		this.roadElevationManager.onRoadUpdated( road );

		this.rebuildRoad( road );

		this.updateRoadBoundingBox( road );

		this.buildLinks( road );

		this.updateRoadObjects( road );

		this.mapService.setRoadOpacity( road );

	}

	private updateRoadBoundingBox ( road: TvRoad ) {

		road.computeBoundingBox();

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

		if ( road.gameObject ) this.mapService.map.gameObject.remove( road.gameObject );

		if ( road.gameObject ) SceneService.removeFromMain( road.gameObject );

		this.roadBuilder.rebuildRoad( road, this.mapService.map );

	}

	private updateRoadGeometries ( road: TvRoad ) {

		const segment = road.spline.findSegment( road );

		if ( !segment ) console.error( 'Road segment not found ' + road.toString() );
		if ( !segment ) return;

		road.clearGeometries();

		if ( segment.geometries.length == 0 ) return;

		segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

	}

}
