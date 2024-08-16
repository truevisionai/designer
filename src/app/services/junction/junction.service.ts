/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Box3, Object3D, Vector3 } from 'three';
import { RoadDividerService } from '../road/road-divider.service';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { JunctionBuilder } from './junction.builder';
import { DebugDrawService } from '../debug/debug-draw.service';
import { BaseToolService } from 'app/tools/base-tool.service';
import { DepConnectionFactory } from "../../map/junction/dep-connection.factory";
import { MapService } from '../map/map.service';
import { Object3DMap } from 'app/core/models/object3d-map';
import { TvContactPoint, TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { MapEvents } from 'app/events/map-events';
import { JunctionRemovedEvent } from 'app/events/junction/junction-removed-event';
import { JunctionCreatedEvent } from 'app/events/junction/junction-created-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TrafficRule } from 'app/map/models/traffic-rule';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { JunctionRoadService } from './junction-road.service';
import { JunctionGeometryService } from "./junction-geometry.service";
import { RoadService } from '../road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseDataService<TvJunction> {

	private objectMap = new Object3DMap<TvJunction, Object3D>();

	constructor (
		private factory: JunctionFactory,
		private dividerService: RoadDividerService,
		public junctionBuilder: JunctionBuilder,
		public connectionService: DepConnectionFactory,
		public debug: DebugDrawService,
		public base: BaseToolService,
		public mapService: MapService,
		public junctionRoadService: JunctionRoadService,
		public junctionGeometryService: JunctionGeometryService,
		public roadService: RoadService,
	) {
		super();
	}

	get junctions () {

		return this.mapService.map.getJunctions();

	}

	getJunctionById ( id: number ) {

		return this.mapService.map.getJunctionById( id );

	}

	addJunction ( junction: TvJunction ) {

		MapEvents.junctionCreated.emit( new JunctionCreatedEvent( junction ) );

	}

	removeJunction ( junction: TvJunction ) {

		MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction ) );

	}

	//createJunctionFromJunctionNodes ( nodes: JunctionNode[] ) {
	//
	//	Debug.log( 'createJunctionFromJunctionNodes', nodes[ 0 ], nodes[ 1 ] );
	//
	//	const coords = nodes.map( node => node.roadCoord );
	//
	//	const junction = this.factory.createJunction();
	//
	//	junction.mesh = this.createMeshFromRoadCoords( coords );
	//
	//	const connections = this.connectionService.createConnections( junction, coords );
	//
	//	connections.forEach( connection => junction.addConnection( connection ) );
	//
	//	Debug.log( connections );
	//
	//	// make connections
	//
	//	// make links
	//
	//	// make connecting-roads
	//
	//	// update roads links
	//
	//	return junction;
	//
	//}

	//createMeshFromRoadCoords ( coords: TvRoadCoord[] ): Mesh {
	//
	//	const points = [];
	//
	//	coords.forEach( roadCoord => {
	//
	//		const s = roadCoord.s;
	//
	//		const rightT = roadCoord.road.getLaneProfile().getRightsideWidth( s );
	//		const leftT = roadCoord.road.getLaneProfile().getLeftSideWidth( s );
	//
	//		const leftCorner = roadCoord.road.getPosThetaAt( s ).addLateralOffset( leftT );
	//		const rightCorner = roadCoord.road.getPosThetaAt( s ).addLateralOffset( -rightT );
	//
	//		points.push( leftCorner );
	//		points.push( rightCorner );
	//
	//	} );
	//
	//	return this.junctionMeshService.createPolygonalMesh( points );
	//
	//}

	//getUniqueRoads ( coords: TvRoadCoord[] ) {
	//
	//	const uniqueRoads = [];
	//
	//	for ( const coord of coords ) {
	//
	//		if ( !uniqueRoads.includes( coord.road ) ) {
	//			uniqueRoads.push( coord.road );
	//		}
	//
	//	}
	//
	//	return uniqueRoads;
	//}

	buildJunctionMesh ( junction: TvJunction ) {

		return this.junctionBuilder.buildFromBoundary( junction );

	}

	removeJunctionMesh ( junction: TvJunction ) {

		this.objectMap.remove( junction );

	}

	createNewJunction () {

		return this.factory.createJunction();

	}

	//createVirtualJunction ( road: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {
	//
	//	return this.factory.createVirtualJunction( road, sStart, sEnd, orientation );
	//
	//}

	createJunctionFromContact (
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const junction = this.factory.createJunction();

		this.addConnectionsFromContact( junction, roadA, contactA, roadB, contactB );

		return junction;
	}

	addConnectionsFromContact (
		junction: TvJunction,
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const coordA = this.roadService.getRoadCoordByContact( roadA, contactA );
		const coordB = this.roadService.getRoadCoordByContact( roadB, contactB );

		this.setLink( roadA, contactA, junction );
		this.setLink( roadB, contactB, junction );

		const connectionA = this.connectionService.createConnection( junction, coordA, coordB );
		junction.addConnection( connectionA );

		const connectionB = this.connectionService.createConnection( junction, coordB, coordA );
		junction.addConnection( connectionB );

		return junction;
	}

	setLink ( road: TvRoad, contact: TvContactPoint, junction: TvJunction ) {

		if ( contact == TvContactPoint.START ) {

			road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		} else if ( contact == TvContactPoint.END ) {

			road.setSuccessor( TvRoadLinkType.JUNCTION, junction );

		}

	}
	add ( object: TvJunction ): void {

		this.addJunction( object );

	}

	all (): TvJunction[] {

		return this.junctions;

	}

	remove ( object: TvJunction ): void {

		this.removeJunction( object );

	}

	update ( object: TvJunction ): void {

		// this.createJunctionMesh( object );

	}

	getJunctionGates ( junction: TvJunction ) {

		const coords: TvLaneCoord[] = [];

		const roads = junction.getIncomingRoads();

		for ( const road of roads ) {

			const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

			const s = contactPoint == TvContactPoint.START ? 0 : road.length;

			const laneSection = road.getLaneProfile().getLaneSectionAt( s );

			let side = road.trafficRule == TrafficRule.LHT ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

			// if road contact is start then reverse the side
			if ( contactPoint == TvContactPoint.START ) {

				side = side == TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;

			}

			const lanes = side == TvLaneSide.LEFT ? laneSection.getLeftLanes() : laneSection.getRightLanes();

			for ( const lane of lanes ) {

				if ( lane.type != TvLaneType.driving ) continue;

				coords.push( new TvLaneCoord( road, laneSection, lane, s, 0 ) );

			}

		}

		return coords;

	}

}
