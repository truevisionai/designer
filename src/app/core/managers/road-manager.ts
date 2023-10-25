import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from "../../events/map-events";
import { TvRoad } from "../../modules/tv-map/models/tv-road.model";
import { TvMapBuilder } from "../../modules/tv-map/builders/tv-map-builder";
import { TvMapInstance } from "../../modules/tv-map/services/tv-map-source-file";
import { RoadControlPoint } from "../../modules/three-js/objects/road-control-point";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { RoadNode } from "../../modules/three-js/objects/road-node";
import { SceneService } from "app/services/scene.service";
import { Manager } from "./manager";
import { AppInspector } from "../inspector";
import { RoadInspector } from "app/views/inspectors/road-inspector/road-inspector.component";

export class RoadManager extends Manager {

	private static _instance = new RoadManager();
	private debug = true;

	static get instance (): RoadManager {
		return this._instance;
	}

	constructor () {

		super();

	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

		MapEvents.roadControlPointCreated.subscribe( e => this.onRoadControlPointCreated( e ) );
		MapEvents.roadControlPointRemoved.subscribe( e => this.onRoadControlPointRemoved( e ) );
		MapEvents.roadControlPointUpdated.subscribe( e => this.onRoadControlPointUpdated( e ) );

	}

	onRoadControlPointUpdated ( event: { road: TvRoad, controlPoint: RoadControlPoint } ) {

		if ( this.debug ) console.debug( 'onRoadControlPointUpdated' );

		event.road.updateGeometryFromSpline();

		event.road.successor?.update( event.road, TvContactPoint.END );
		event.road.predecessor?.update( event.road, TvContactPoint.START );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( event.road, true ) );

	}

	onRoadControlPointRemoved ( event: { road: TvRoad, controlPoint: RoadControlPoint } ) {

		if ( this.debug ) console.debug( 'onRoadControlPointRemoved' );

		event.road.updateGeometryFromSpline();

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( event.road, true ) );

	}

	onRoadControlPointCreated ( event: { road: TvRoad, controlPoint: RoadControlPoint } ) {

		if ( this.debug ) console.debug( 'onRoadControlPointCreated' );

		event.road.updateGeometryFromSpline();

		// TODO: check if we need to update the road inspector
		// AppInspector.setInspector( RoadInspector, {
		// 	road: event.road,
		// 	controlPoint: event.controlPoint
		// } );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( event.road, true ) );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadUpdated' );

		TvMapBuilder.removeRoad( TvMapInstance.map.gameObject, event.road );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, event.road );

		this.updateRoadNodes( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		if ( this.debug ) console.debug( 'onRoadRemoved' );

		event.road.hide();

		if ( event.hideHelpers ) event.road.hideHelpers();

		if ( event.hideHelpers ) event.road.spline?.hideLines();

		if ( event.road.isJunction ) {

			event.road.junctionInstance?.removeConnectingRoad( event.road );

		}

		if ( !event.road.isJunction ) {

			event.road.removePredecessor();

			event.road.removeSuccessor();

		}

		TvMapInstance.map.gameObject.remove( event.road.gameObject );
	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadCreated' );

		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, event.road );

		if ( event.showHelpers ) this.showNodes( event.road );

		if ( event.showHelpers ) event.road.spline.show();

	}

	showNodes ( road: TvRoad ): void {

		this.updateRoadNodes( road );

		road.startNode.visible = true;

		road.endNode.visible = true;

	}

	updateRoadNodes ( road: TvRoad ) {

		if ( !road.startNode ) {

			road.startNode = this.createRoadNode( road, TvContactPoint.START );

		} else {

			road.startNode.update();

		}

		if ( !road.endNode ) {

			road.endNode = this.createRoadNode( road, TvContactPoint.END );

		} else {

			road.endNode.update();

		}

	}

	createRoadNode ( road: TvRoad, contact: TvContactPoint ): RoadNode {

		const node = new RoadNode( road, contact );

		SceneService.addToolObject( node );

		return node;

	}
}
