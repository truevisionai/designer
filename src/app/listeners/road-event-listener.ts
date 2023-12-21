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
import { IntersectionService } from "app/services/junction/intersection.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { Box3, Vector3 } from "three";
import { JunctionService } from "app/services/junction/junction.service";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { SceneService } from "app/services/scene.service";
import { JunctionConnectionService } from "app/services/junction/junction-connection.service";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { SplineSegmentType } from "app/core/shapes/spline-segment";

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
		private intersectionService: IntersectionService,
		private debugService: DebugDrawService,
		private junctionService: JunctionService,
		private junctionConnectionService: JunctionConnectionService
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

		this.checkIntersections( event.road );

		this.updateElevationNodes( event.road );

		this.rebuildNeighbours( event.road );

		this.updateRoadObjects( event.road );

	}

	updateRoadBoundingBox ( road: TvRoad ) {

		road.computeBoundingBox();

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {


	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		this.roadLinkService.linkSuccessor( event.road, event.road.successor );

		this.roadLinkService.linkPredecessor( event.road, event.road.predecessor );

		this.roadElevationService.createDefaultNodes( event.road );

	}

	checkIntersections ( road: TvRoad ) {

		// console.time( "time" );

		const roads = this.roadService.roads.filter( road => !road.isJunction );

		for ( let i = 0; i < roads.length; i++ ) {

			const otherRoad = roads[ i ];

			const intersection = this.intersectionService.detectIntersections( road, otherRoad );

			if ( !intersection ) continue;

			// console.log( 'intersection detected', intersection );

			this.createIntersection( road, otherRoad, intersection );

		}

		// console.timeEnd( "time" );

	}

	private buildRoad ( road: TvRoad ): void {

		this.roadSplineService.rebuildSplineRoads( road.spline );

	}

	private updateRoadObjects ( road: TvRoad ): void {

		this.roadObjectService.updateRoadObjectPositions( road );

	}

	private createIntersection ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ): void {

		const junction = this.junctionService.createNewJunction();

		// this.debugService.drawSphere( position, 1 );

		let coordA = roadA.getCoordAt( position ).toRoadCoord( roadA );
		let coordB = roadB.getCoordAt( position ).toRoadCoord( roadB );

		// if (coordA.road.spline.hasJuncti)

		const roadC = this.roadService.cutRoadFromTo( roadA, coordA.s - 10, coordA.s + 10, junction.id, SplineSegmentType.JUNCTION );
		const roadD = this.roadService.cutRoadFromTo( roadB, coordB.s - 10, coordB.s + 10, junction.id, SplineSegmentType.JUNCTION );

		if ( roadC ) coordA.s -= 10;
		if ( roadD ) coordB.s -= 10;

		this.junctionService.addConnectionsFromContact( junction, roadA, coordA.contact, roadB, coordB.contact );

		if ( roadC ) {

			this.roadService.addRoad( roadC );

			this.junctionService.addConnectionsFromContact( junction, roadA, coordA.contact, roadC, TvContactPoint.START );
			this.junctionService.addConnectionsFromContact( junction, roadB, coordB.contact, roadC, TvContactPoint.START );
		}

		if ( roadD ) {

			this.roadService.addRoad( roadD );

			this.junctionService.addConnectionsFromContact( junction, roadB, coordB.contact, roadD, TvContactPoint.START );
			this.junctionService.addConnectionsFromContact( junction, roadA, coordA.contact, roadD, TvContactPoint.START );

		}

		if ( roadC && roadD ) {

			this.junctionService.addConnectionsFromContact( junction, roadC, TvContactPoint.START, roadD, TvContactPoint.START );

		}

		this.junctionService.addJunction( junction );


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
