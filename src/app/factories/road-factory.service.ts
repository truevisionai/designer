/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/objects/road/road-node';
import { TvContactPoint, TvLaneSide, TvLaneType, TvRoadType } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector2, Vector3 } from 'three';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { Injectable } from '@angular/core';
import { TvJunction } from "../map/models/junctions/tv-junction";
import { TvElevationProfile } from 'app/map/road-elevation/tv-elevation-profile.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { LaneSectionFactory } from './lane-section.factory';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvLink } from 'app/map/models/tv-link';
import { LinkFactory } from 'app/map/models/link-factory';
import { MapService } from "../services/map/map.service";
import { ControlPointFactory } from "./control-point.factory";
import { RoadStyleManager } from 'app/assets/road-style/road-style.manager';

@Injectable( {
	providedIn: 'root'
} )
export class RoadFactory {

	constructor (
		private mapService: MapService,
		private laneSectionFactory: LaneSectionFactory,
		private roadStyleManager: RoadStyleManager
	) {
	}

	getNextRoadId ( id?: number ) {

		return this.mapService.map.roads.next();

	}

	getNextConnectingRoadId () {

		return this.mapService.map.roads.next( false );

	}

	setCounter ( id: number ) {

		// this.mapService.map.roads.add( id );

	}

	//static cloneRoad ( road: TvRoad, s = 0 ): TvRoad {
	//
	//	const cloned = road.clone( s );
	//
	//	cloned.id = this.IDService.getUniqueID();
	//
	//	return cloned;
	//
	//}

	//static createFirstRoadControlPoint ( position: Vector3 ) {
	//
	//	const road = this.createDefaultRoad( TvRoadType.TOWN, 40 );
	//
	//	const point = road.addControlPointAt( position );
	//
	//	road.spline.addRoadSegment( 0, road.id );
	//
	//	return { point, road };
	//
	//}

	createRampRoad ( lane?: TvLane ): TvRoad {

		const road = this.createNewRoad();

		// FIX: minor elevation to avoid z-fighting
		// road.getElevationProfile().addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = this.roadStyleManager.getRampRoadStyle( road, lane );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createDefaultRoad ( type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getRoadStyle( road );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSectionInstance( roadStyle.laneSection );

		road.addElevationProfile( roadStyle.elevationProfile );

		return road;

	}

	createHighwayRoad ( type: TvRoadType = TvRoadType.MOTORWAY, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const laneSection = road.getLaneProfile().addGetLaneSection( 0 );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, true );
		laneSection.createLane( TvLaneSide.RIGHT, -1, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 3.6, 0, 0, 0 );
		laneSection.createLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.createLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.createLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.createLane( TvLaneSide.RIGHT, -5, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.createLane( TvLaneSide.RIGHT, -6, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );

		return road;

	}

	createParkingRoad ( type: TvRoadType = TvRoadType.LOW_SPEED, maxSpeed: number = 10 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getParkingRoadStyle( road );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createFromControlPoints ( controlPoints: Vector2[], type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createDefaultRoad( type, maxSpeed );

		controlPoints.forEach( value => {

			const position = new Vector3( value.x, value.y, 0 );

			const point = ControlPointFactory.createControl( road.spline, position );

			road.spline.controlPoints.push( point );

		} );

		return road;

	}

	createStraightRoad ( position: Vector3, hdg = 0, length = 10 ): TvRoad {

		const road = this.createDefaultRoad();

		road.getPlanView().addGeometryLine( 0, position.x, position.y, hdg, length );

		return road;

	}

	createSingleLaneRoad ( width = 3.6, side = TvLaneSide.RIGHT ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = road.getLaneProfile().addGetLaneSection( 0 );

		if ( side === TvLaneSide.LEFT ) {
			laneSection.createLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.createLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		}

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		laneSection.getLaneArray().forEach( lane => {

			if ( lane.side === TvLaneSide.CENTER ) return;

			if ( lane.type !== TvLaneType.driving ) return;

			lane.addWidthRecord( 0, width, 0, 0, 0 );

		} );

		return road;

	}

	createRoadWithLaneCount ( leftCount = 1, rightCount = 1, leftWidth = 3.6, rightWidth = 3.6 ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = road.getLaneProfile().addGetLaneSection( 0 );

		for ( let i = 1; i <= leftCount; i++ ) {

			const lane = laneSection.createLane( TvLaneSide.LEFT, i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, leftWidth, 0, 0, 0 );

		}

		for ( let i = 1; i <= rightCount; i++ ) {

			const lane = laneSection.createLane( TvLaneSide.RIGHT, -i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, rightWidth, 0, 0, 0 );

		}

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		return road;

	}

	createJoiningRoad ( spline: AbstractSpline, firstNode: RoadNode, secondNode: RoadNode ): TvRoad {

		const road = this.createDefaultRoad();

		road.spline = spline;

		road.getLaneProfile().clearLaneSections();

		const laneSections = this.laneSectionFactory.createFromRoadNode( road, firstNode, secondNode );

		for ( const laneSection of laneSections ) {

			road.getLaneProfile().addLaneSectionInstance( laneSection );

		}

		if ( firstNode.road.hasType ) {

			const s = firstNode.contact === TvContactPoint.START ? 0 : firstNode.road.length;

			const roadType = firstNode.road.getRoadTypeAt( s );

			road.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			road.setType( TvRoadType.TOWN, 40 );

		}

		return road;
	}

	createFromLinks ( spline: AbstractSpline, firstNode: TvLink, secondNode: TvLink ): TvRoad {

		const road = this.createDefaultRoad();

		road.spline = spline;

		road.getLaneProfile().clearLaneSections();

		const laneSections = this.laneSectionFactory.createFromRoadLink( road, firstNode, secondNode );

		for ( const laneSection of laneSections ) {

			road.getLaneProfile().addLaneSectionInstance( laneSection );

		}

		const firstRoad = firstNode.element as TvRoad;

		if ( firstRoad.hasType ) {

			const s = firstNode.contactPoint === TvContactPoint.START ? 0 : firstRoad.length;

			const roadType = firstRoad.getRoadTypeAt( s );

			road.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			road.setType( TvRoadType.TOWN, 40 );

		}

		return road;
	}

	private computeElevationProfile (
		roadLength: number,
		firstRoad: TvRoad,
		firstS: number,
		secondRoad: TvRoad,
		secondS: number
	): TvElevationProfile {

		const profile = new TvElevationProfile();

		const startElevation = firstRoad.getElevationProfile().getElevationValue( firstS )
		const endElevation = secondRoad.getElevationProfile().getElevationValue( secondS );

		profile.createAndAddElevation( 0, startElevation, 0, 0, 0 );
		profile.createAndAddElevation( roadLength, endElevation, 0, 0, 0 );

		TvUtils.computeCoefficients( profile.getElevations(), roadLength );

		return profile;
	}

	createNewRoad ( name?: string, length?: number, id?: number, junction?: TvJunction ): TvRoad {

		const roadId = id || this.getNextRoadId( id );

		const roadName = name || `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		const spline = new AutoSpline();

		spline.addSegment( 0, road );

		road.spline = spline;

		return road;

	}

	createFakeRoad ( name?: string, length?: number, junction?: TvJunction ): TvRoad {

		const roadId = -1;

		const roadName = name || `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		return road;

	}

	createConnectingRoad ( junction: TvJunction, entry: TvLaneCoord, exit: TvLaneCoord ): TvRoad {

		const roadId = this.getNextConnectingRoadId();

		const roadName = `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		road.predecessor = LinkFactory.createRoadLink( entry.road, entry.contact );

		road.successor = LinkFactory.createRoadLink( exit.road, exit.contact );

		return road;

	}

}
