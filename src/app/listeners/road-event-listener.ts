import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from "../events/map-events";
import { TvMapInstance } from "../modules/tv-map/services/tv-map-instance";
import { Manager } from "../managers/manager";
import { RoadService } from "app/services/road/road.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { MapService } from "../services/map.service";
import { LaneService } from "app/tools/lane/lane.service";

export class RoadEventListener extends Manager {

	private debug = true;

	constructor (
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private roadLinkService: RoadLinkService,
		private mapService: MapService,
		private laneService: LaneService
	) {

		super();
	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadUpdated' );

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.roadSplineService.rebuildSplineRoads( event.road.spline );

		if ( event.showHelpers ) this.roadService.updateRoadNodes( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		this.roadService.removeRoad( event.road );

	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadCreated' );

		this.roadSplineService.addRoadSegment( event.road );

		this.roadSplineService.rebuildSplineRoads( event.road.spline );

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.roadLinkService.linkSuccessor( event.road, event.road.successor );

		this.roadLinkService.linkPredecessor( event.road, event.road.predecessor );

		// if ( event.showHelpers ) this.roadService.showRoadNodes( event.road );

		// if ( event.showHelpers ) event.road.spline.show();

		// if ( event.showHelpers ) MapEvents.roadSelected.emit( new RoadSelectedEvent( event.road ) );

		// ToolManager.currentTool.onRoadCreated( event.road );

	}

}
