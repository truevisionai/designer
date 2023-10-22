import { MapEvents } from "../../events/map-events";
import { TvRoad } from "../../modules/tv-map/models/tv-road.model";
import { TvMapBuilder } from "../../modules/tv-map/builders/tv-map-builder";
import { TvMapInstance } from "../../modules/tv-map/services/tv-map-source-file";
import { RoadControlPoint } from "../../modules/three-js/objects/road-control-point";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { RoadNode } from "../../modules/three-js/objects/road-node";
import { SceneService } from "app/core/services/scene.service";

export class RoadManager {

	private static _instance = new RoadManager();
	private debug = true;

	static get instance (): RoadManager {
		return this._instance;
	}

	private constructor () {

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

		TvMapBuilder.removeRoad( TvMapInstance.map.gameObject, event.road );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, event.road );

		this.updateRoadNodes( event.road );

	}

	onRoadControlPointRemoved ( event: { road: TvRoad, controlPoint: RoadControlPoint } ) {

		if ( this.debug ) console.debug( 'onRoadControlPointRemoved' );

		event.road.updateGeometryFromSpline();

		TvMapBuilder.removeRoad( TvMapInstance.map.gameObject, event.road );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, event.road );

		this.updateRoadNodes( event.road );

	}

	onRoadControlPointCreated ( event: { road: TvRoad, controlPoint: RoadControlPoint } ) {

		if ( this.debug ) console.debug( 'onRoadControlPointCreated' );

		event.road.updateGeometryFromSpline();

		TvMapBuilder.removeRoad( TvMapInstance.map.gameObject, event.road );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, event.road );

		this.updateRoadNodes( event.road );

	}

	onRoadUpdated ( road: TvRoad ) {

		if ( this.debug ) console.debug( 'onRoadUpdated' );

		TvMapBuilder.removeRoad( TvMapInstance.map.gameObject, road );
		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, road );

		this.updateRoadNodes( road );

	}

	onRoadRemoved ( road: TvRoad ) {

		if ( this.debug ) console.debug( 'onRoadRemoved' );

		road.hide();

		road.hideHelpers();

		if ( road.isJunction ) {

			road.junctionInstance?.removeConnectingRoad( road );

		}

		if ( !road.isJunction ) {

			road.removePredecessor();

			road.removeSuccessor();

		}

		TvMapInstance.map.gameObject.remove( road.gameObject );
	}

	onRoadCreated ( road: TvRoad ) {

		if ( this.debug ) console.debug( 'onRoadCreated' );

		TvMapBuilder.buildRoad( TvMapInstance.map.gameObject, road );

		// this.updateRoadNodes();

	}

	init () {

		// this.onRoadCreated = this.onRoadCreated.bind( this );

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

		SceneService.add( node );

		return node;

	}
}
