import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from "../events/map-events";
import { TvRoad } from "../modules/tv-map/models/tv-road.model";
import { TvMapBuilder } from "../modules/tv-map/builders/tv-map-builder";
import { TvMapInstance } from "../modules/tv-map/services/tv-map-source-file";
import { Manager } from "../managers/manager";
import { RoadService } from "app/services/road/road.service";
import { ToolManager } from "app/tools/tool-manager";
import { RoadLinkService } from "app/services/road/road-link.service";

export class RoadEventListener extends Manager {

	private static _instance = new RoadEventListener();
	private debug = true;
	private roadService: RoadService;
	private roadLinkService: RoadLinkService;

	static get instance (): RoadEventListener {
		return this._instance;
	}

	constructor () {

		super();

		this.roadService = new RoadService();
		this.roadLinkService = new RoadLinkService();

	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );


	}


	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadUpdated' );

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.regenerateGeometries( event.road );

		TvMapBuilder.rebuildRoad( event.road );

		this.roadService.updateRoadNodes( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		if ( this.debug ) console.debug( 'onRoadRemoved' );

		event.road.hide();

		if ( event.hideHelpers ) event.road.hideHelpers();

		if ( event.hideHelpers ) event.road.spline?.hideLines();

		if ( event.road.isJunction ) {

			event.road.junctionInstance?.removeConnectingRoad( event.road );

		}

		this.roadService.hideRoadNodes( event.road );

		this.roadLinkService.removeLinks( event.road );

		TvMapInstance.map.gameObject.remove( event.road.gameObject );
	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadCreated' );

		this.regenerateGeometries( event.road );

		if ( event.road.spline.controlPoints.length < 2 ) return;

		// if ( event.showHelpers ) this.roadService.showRoadNodes( event.road );

		// if ( event.showHelpers ) event.road.spline.show();

		// if ( event.showHelpers ) MapEvents.roadSelected.emit( new RoadSelectedEvent( event.road ) );

		ToolManager.currentTool.onRoadCreated( event.road );

	}

	private regenerateGeometries ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		console.debug( 'regen', road );

		road.spline?.getRoadSegments().forEach( segment => {

			const road = TvMapInstance.map.getRoadById( segment.roadId );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			TvMapBuilder.rebuildRoad( road );

		} );
	}
}
