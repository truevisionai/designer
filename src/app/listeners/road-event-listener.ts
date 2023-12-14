import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from "../events/map-events";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadObjectService } from "app/tools/marking-line/road-object.service";
import { RoadElevationService } from "app/services/road/road-elevation.service";
import { TvRoadLinkChildType } from "app/modules/tv-map/models/tv-road-link-child";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";
import { RoadService } from "app/services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadEventListener {

	constructor (
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private roadLinkService: RoadLinkService,
		private roadObjectService: RoadObjectService,
		private roadElevationService: RoadElevationService,
	) {
	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.rebuildRoad( event.road );

		this.updateElevationNodes( event.road );

		this.rebuildNeighbours( event.road );

		this.updateRoadObjects( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {


	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		this.roadLinkService.linkSuccessor( event.road, event.road.successor );

		this.roadLinkService.linkPredecessor( event.road, event.road.predecessor );

		this.roadElevationService.createDefaultNodes( event.road );

	}

	private rebuildRoad ( road: TvRoad ): void {

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
