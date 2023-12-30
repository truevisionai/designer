import { MapEvents } from "../events/map-events";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadObjectService } from "app/tools/marking-line/road-object.service";
import { RoadElevationService } from "app/services/road/road-elevation.service";
import { TvRoadLinkChildType } from "app/modules/tv-map/models/tv-road-link-child";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";
import { RoadService } from "app/services/road/road.service";
import { MapService } from "app/services/map.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionService } from "app/services/junction/junction.service";
import { RoadCreatedEvent } from "../events/road/road-created-event";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { RoadRemovedEvent } from "../events/road/road-removed-event";

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
	) {
	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.buildRoad( event.road );

		this.updateRoadBoundingBox( event.road );

		this.updateElevationNodes( event.road );

		this.rebuildNeighbours( event.road );

		this.updateRoadObjects( event.road );

		this.updateJunction( event.road );
	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		event.road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( object );

		} );

		this.roadLinkService.removeLinks( event.road );

		this.roadSplineService.removeRoadSegment( event.road );

		this.roadSplineService.rebuildSplineRoads( event.road.spline );

		this.updateLinks( event.road );

		this.mapService.map.gameObject.remove( event.road.gameObject );

		this.mapService.map.removeRoad( event.road );

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

	onRoadCreated ( event: RoadCreatedEvent ) {

		this.roadLinkService.addLinks( event.road );

		this.roadElevationService.createDefaultNodes( event.road );

	}

	updateJunction ( road: TvRoad ) {

		if ( !road.isJunction ) return;

		road.junctionInstance.boundingBox = this.junctionService.computeBoundingBox( road.junctionInstance );

	}

	updateRoadBoundingBox ( road: TvRoad ) {

		road.computeBoundingBox();

	}

	private buildRoad ( road: TvRoad ): void {

		this.roadSplineService.rebuildSplineRoads( road.spline );

	}

	private updateRoadObjects ( road: TvRoad ): void {

		this.roadObjectService.updateRoadObjectPositions( road );

	}

	private updateElevationNodes ( road: TvRoad ): void {

		this.roadElevationService.createDefaultNodes( road );

		if ( road.elevationProfile.getElevationCount() < 2 ) return;

		const lastIndex = road.elevationProfile.elevation.length - 1;

		const lastElevationNode = road.elevationProfile.elevation[ lastIndex ];

		lastElevationNode.s = road.length;

		if ( road.successor && road.successor.elementType == TvRoadLinkChildType.road ) {

			const successor = this.roadLinkService.getElement<TvRoad>( road.successor );

			this.roadElevationService.createDefaultNodes( successor );

			const firstSuccessorElevation = successor.elevationProfile.elevation[ 0 ];

			firstSuccessorElevation.a = road.getElevationValue( road.length );

			TvUtils.computeCoefficients( successor.elevationProfile.elevation, successor.length );
		}

		if ( road.predecessor && road.predecessor.elementType == TvRoadLinkChildType.road ) {

			const predecessor = this.roadLinkService.getElement<TvRoad>( road.predecessor );

			this.roadElevationService.createDefaultNodes( predecessor );

			const lastPredecessorElevation = predecessor.elevationProfile.elevation[ predecessor.elevationProfile.elevation.length - 1 ];

			lastPredecessorElevation.a = road.getElevationValue( 0 );

			TvUtils.computeCoefficients( predecessor.elevationProfile.elevation, predecessor.length );

		}

	}


	private rebuildNeighbours ( road: TvRoad ): void {

		this.roadService.rebuildLink( road.predecessor );

		this.roadService.rebuildLink( road.successor );

	}

}
