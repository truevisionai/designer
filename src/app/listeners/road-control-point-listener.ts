import { MapEvents, RoadControlPointCreatedEvent, RoadControlPointRemovedEvent, RoadControlPointUpdatedEvent, RoadUpdatedEvent } from "../events/map-events";
import { Manager } from "../managers/manager";
import { RoadService } from "app/services/road/road.service";
import { SceneService } from "app/services/scene.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { RoadLinkService } from "app/services/road/road-link.service";
import { AbstractControlPoint } from "app/modules/three-js/objects/abstract-control-point";
import { ToolManager } from "app/tools/tool-manager";
import { MapService } from "app/services/map.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvRoadLinkChild, TvRoadLinkChildType } from "app/modules/tv-map/models/tv-road-link-child";

export class RoadControlPointListener extends Manager {

	debug: any;

	constructor (
		private roadService: RoadService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
	) {

		super();

	}

	init () {

		MapEvents.roadControlPointCreated.subscribe( e => this.onRoadControlPointCreated( e ) );
		MapEvents.roadControlPointRemoved.subscribe( e => this.onRoadControlPointRemoved( e ) );
		MapEvents.roadControlPointUpdated.subscribe( e => this.onRoadControlPointUpdated( e ) );

		MapEvents.controlPointSelected.subscribe( e => this.onControlPointSelected( e ) );
		MapEvents.controlPointUnselected.subscribe( e => this.onControlPointUnselected( e ) );

	}

	onControlPointUnselected ( e: AbstractControlPoint ): void {

		// ToolManager.getTool<any>()?.onControlPointUnselected( e );

	}

	onControlPointSelected ( e: AbstractControlPoint ): void {

		// ToolManager.getTool<any>()?.onControlPointSelected( e );

	}

	onRoadControlPointUpdated ( event: RoadControlPointUpdatedEvent ) {

		// NOT NEEDED

		// if ( this.debug ) console.debug( 'onRoadControlPointUpdated' );

		// const spline = event.road.spline || event.controlPoint.mainObject;

		// if ( !spline ) console.warn( 'no spline' );

		// spline?.getRoadSegments().forEach( segment => {

		// 	if ( segment.roadId == -1 ) return;

		// 	const road = this.mapService.map.getRoadById( segment.roadId );

		// 	this.roadService.rebuildLinks( road, event.controlPoint );

			// MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

		// } );

	}

	onRoadControlPointRemoved ( event: RoadControlPointRemovedEvent ) {

		if ( this.debug ) console.debug( 'onRoadControlPointRemoved' );

		// SceneService.removeFromTool( event.controlPoint );

		// this.roadService.updateSplineGeometries( event.road );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( event.road, true ) );

	}

	onRoadControlPointCreated ( event: RoadControlPointCreatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadControlPointCreated' );

		// SceneService.addToolObject( event.controlPoint );

		// this.roadService.updateSplineGeometries( event.road );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( event.road, true ) );

	}

}
