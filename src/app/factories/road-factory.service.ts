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
import { RoadStyleManager } from 'app/assets/road-style/road-style.manager';
import { TvRoadCoord } from "../map/models/TvRoadCoord";
import { SplineFactory } from "../services/spline/spline.factory";
import { LANE_WIDTH } from "../map/models/tv-lane-width";

export class RoadMakeOptions {
	maxSpeed?: number = 40;
	type?: TvRoadType = TvRoadType.UNKNOWN;
	id?: number;
	position?: Vector3;
	hdg?: number = 0;
	length?: number = 100
	leftLaneCount?: number = 0;
	rightLaneCount?: number = 1;
	leftWidth?: number = 3.6;
	rightWidth?: number = 3.6;
}

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

	static createRoad ( id: number = -1 ): TvRoad {

		return new TvRoad( '', 0, id, null );

	}

	static makeRoad ( options?: RoadMakeOptions ): TvRoad {

		const road = this.createRoad( options?.id );

		const position = options.position ?? new Vector3( 0, 0, 0 );
		const hdg = options.hdg ?? 0;
		const length = options.length ?? 10;

		road.getPlanView().addGeometryLine( 0, position.x, position.y, hdg, length );

		const laneSection = LaneSectionFactory.createLaneSection(
			options.leftLaneCount ?? 0,
			options.leftWidth ?? LANE_WIDTH.DEFAULT_LANE_WIDTH,
			options.rightLaneCount ?? 0,
			options.rightWidth ?? LANE_WIDTH.DEFAULT_LANE_WIDTH
		);

		road.getLaneProfile().addLaneSection( laneSection );

		return road;

	}

	static makeHighwayRoad ( options?: RoadMakeOptions ): TvRoad {

		const road = this.createRoad();

		const position = options.position ?? new Vector3( 0, 0, 0 );
		const hdg = options.hdg ?? 0;
		const length = options.length ?? 10;

		road.getPlanView().addGeometryLine( 0, position.x, position.y, hdg, length );

		const laneSection = road.getLaneProfile().addDefaultLaneSection();

		laneSection.createCenterLane( 0, TvLaneType.none, false, true );
		laneSection.createRightLane( -1, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, options.rightWidth, 0, 0, 0 );

		for ( let id = 1; id <= options.rightLaneCount; id++ ) {
			laneSection.createRightLane( -( id + 1 ), TvLaneType.driving, false, true ).addWidthRecord( 0, options.rightWidth, 0, 0, 0 );
		}

		laneSection.createRightLane( ( options.rightLaneCount + 2 ) * -1, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, options.rightWidth, 0, 0, 0 );

		return road;

	}

	getNextRoadId ( id?: number ): any {

		return this.mapService.map.generateRoadId();

	}

	getNextConnectingRoadId (): any {

		return this.mapService.map.generateRoadId( false );

	}

	setCounter ( id: number ): void {

		// this.mapService.map.roads.add( id );

	}

	createRampRoad ( lane?: TvLane ): TvRoad {

		const road = this.createNewRoad();

		// FIX: minor elevation to avoid z-fighting
		// road.getElevationProfile().addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = this.roadStyleManager.getRampRoadStyle( road, lane );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSection( roadStyle.laneSection );

		return road;

	}

	createDefaultRoad ( type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getRoadStyle( road );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSection( roadStyle.laneSection );

		road.addElevationProfile( roadStyle.elevationProfile );

		return road;

	}

	static createDefaultRoad ( params?: Partial<TvRoad> ): TvRoad {

		const road = this.createRoad( params?.id );

		const roadStyle = RoadStyleManager.getDefaultRoadStyle( road );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSection( roadStyle.laneSection );

		road.addElevationProfile( roadStyle.elevationProfile );

		return road;

	}

	createParkingRoad ( type: TvRoadType = TvRoadType.LOW_SPEED, maxSpeed: number = 10 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getParkingRoadStyle( road );

		road.getLaneProfile().addLaneOffset( roadStyle.laneOffset );

		road.getLaneProfile().addLaneSection( roadStyle.laneSection );

		return road;

	}

	createFromControlPoints ( controlPoints: Vector2[], type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createDefaultRoad( type, maxSpeed );

		controlPoints.forEach( value => {

			const position = new Vector3( value.x, value.y, 0 );

			road.spline.addControlPoint( position );

		} );

		return road;

	}

	createStraightRoad ( position: Vector3, hdg: number = 0, length: number = 10 ): TvRoad {

		const road = this.createDefaultRoad();

		road.getPlanView().addGeometryLine( 0, position.x, position.y, hdg, length );

		return road;

	}

	createSingleLaneRoad ( width: number = 3.6, side: any = TvLaneSide.RIGHT ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = road.getLaneProfile().addDefaultLaneSection();

		if ( side === TvLaneSide.LEFT ) {
			laneSection.createLeftLane( 1, TvLaneType.driving, false, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.createRightLane( -1, TvLaneType.driving, false, true );
		}

		laneSection.createCenterLane( 0, TvLaneType.driving, false, true );

		laneSection.getNonCenterLanes().forEach( lane => {

			if ( lane.type !== TvLaneType.driving ) return;

			lane.addWidthRecord( 0, width, 0, 0, 0 );

		} );

		return road;

	}

	createRoadWithLaneCount ( leftCount: number = 1, rightCount: number = 1, leftWidth: number = 3.6, rightWidth: number = 3.6 ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = LaneSectionFactory.createLaneSection( leftCount, leftWidth, rightCount, rightWidth );

		road.getLaneProfile().addLaneSection( laneSection );

		return road;

	}

	createJoiningRoad ( spline: AbstractSpline, firstNode: RoadNode, secondNode: RoadNode ): TvRoad {

		const road = this.createDefaultRoad();

		road.spline = spline;

		road.getLaneProfile().clearLaneSections();

		const laneSections = LaneSectionFactory.createFromRoadNode( firstNode, secondNode );

		for ( const laneSection of laneSections ) {

			road.getLaneProfile().addLaneSection( laneSection );

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

	static createJoiningRoad ( previousRoad: TvRoadCoord | RoadNode, nextRoad: TvRoadCoord | RoadNode ): TvRoad {

		const spline = SplineFactory.createFromRoadCoords( previousRoad, nextRoad );

		const road = this.createRoad();

		road.spline = spline;

		road.sStart = 0;

		const laneSections = LaneSectionFactory.createFromRoadCoord( previousRoad, nextRoad );

		for ( const laneSection of laneSections ) {

			road.getLaneProfile().addLaneSection( laneSection );

		}

		if ( previousRoad.road.hasType ) {

			const s = previousRoad.contact === TvContactPoint.START ? 0 : previousRoad.road.length;

			const roadType = previousRoad.road.getRoadTypeAt( s );

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

			road.getLaneProfile().addLaneSection( laneSection );

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

		road.setPredecessorRoad( entry.road, entry.contact );

		road.setSuccessorRoad( exit.road, exit.contact );

		return road;

	}

}
