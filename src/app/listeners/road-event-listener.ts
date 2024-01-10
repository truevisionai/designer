import { MapEvents } from "../events/map-events";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadObjectService } from "app/tools/marking-line/road-object.service";
import { RoadElevationService } from "app/services/road/road-elevation.service";
import { RoadService } from "app/services/road/road.service";
import { MapService } from "app/services/map.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionService } from "app/services/junction/junction.service";
import { RoadCreatedEvent } from "../events/road/road-created-event";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { RoadFactory } from "app/factories/road-factory.service";
import { RoadManager } from "app/managers/road-manager";

@Injectable( {
	providedIn: 'root'
} )
export class RoadEventListener {

	constructor (
		private mapService: MapService,
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private roadLinkService: RoadLinkService,
		private roadObjectService: RoadObjectService,
		private roadElevationService: RoadElevationService,
		private intersectionService: IntersectionService,
		private junctionService: JunctionService,
		private roadFactory: RoadFactory,
		private roadManager: RoadManager,
	) {
	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		this.roadManager.addRoad( event.road );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.roadManager.updateRoad( event.road );

		this.updateJunction( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		event.road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( object );

		} );

		// this.roadLinkService.removeLinks( event.road );

		if ( event.road.isJunction ) {

			this.mapService.map.removeSpline( event.road.spline );

		} else {

			this.roadSplineService.removeRoadSegment( event.road );

		}

		// this.roadSplineService.removeRoadSegment( event.road );

		// this.roadSplineService.rebuildSplineRoads( event.road.spline );

		// this.updateLinks( event.road );

		this.mapService.map.gameObject.remove( event.road.gameObject );

		this.mapService.map.removeRoad( event.road );

		this.roadFactory.idRemoved( event.road.id );

	}

	updateLinks ( road: TvRoad ) {

		if ( road.successor?.isJunction ) {

			const junction = this.roadLinkService.getElement<TvJunction>( road.successor );

			this.intersectionService.postProcessJunction( junction );

			this.junctionService.buildJunction( junction );
		}

		if ( road.predecessor?.isJunction ) {

			const junction = this.roadLinkService.getElement<TvJunction>( road.predecessor );

			this.intersectionService.postProcessJunction( junction );

			this.junctionService.buildJunction( junction );
		}

	}

	updateJunction ( road: TvRoad ) {

		if ( !road.isJunction ) return;

		road.junctionInstance.boundingBox = this.junctionService.computeBoundingBox( road.junctionInstance );

	}

}
