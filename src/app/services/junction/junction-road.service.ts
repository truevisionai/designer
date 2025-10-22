/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Log } from 'app/core/utils/log';
import { LinkFactory } from 'app/map/models/link-factory';
import { TvContactPoint, TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { RoadService } from '../road/road.service';
import { MapService } from '../map/map.service';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TrafficRule } from 'app/map/models/traffic-rule';
import { LaneDistance } from 'app/map/road/road-distance';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionRoadService {

	constructor (
		private roadService: RoadService,
		private mapService: MapService
	) {
	}

	linkRoads ( junction: TvJunction ): void {

		if ( !this.shouldLinkRoads( junction ) ) return;

		const incomingRoads = junction.getIncomingRoads();

		for ( const road of incomingRoads ) {

			const startPosition = road.getStartPosTheta().toVector3();
			const endPosition = road.getEndPosTheta().toVector3();

			const startDistance = startPosition.distanceTo( junction.centroid );
			const endDistance = endPosition.distanceTo( junction.centroid );

			// start is closer to junction than end, so its likely a predecessor
			if ( startDistance < endDistance ) {

				road.setPredecessor( LinkFactory.createJunctionLink( junction ) );

			} else {

				road.setSuccessor( LinkFactory.createJunctionLink( junction ) );

			}


		}

	}

	removeLinks ( junction: TvJunction ): void {



	}



	getJunctionGates ( junction: TvJunction ): TvLaneCoord[] {

		const coords: TvLaneCoord[] = [];

		const incomingRoads = junction.getIncomingRoads();

		for ( const incomingRoad of incomingRoads ) {

			const contactPoint = incomingRoad.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

			const laneSection = incomingRoad.getLaneProfile().getLaneSectionAtContact( contactPoint );

			const laneSOffset = contactPoint == TvContactPoint.START ? 0 : laneSection.getLength();

			let side = incomingRoad.trafficRule == TrafficRule.LHT ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

			// if road contact is start then reverse the side
			if ( contactPoint == TvContactPoint.START ) {

				side = side == TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;

			}

			const lanes = side == TvLaneSide.LEFT ? laneSection.getLeftLanes() : laneSection.getRightLanes();

			for ( const lane of lanes ) {

				if ( lane.type != TvLaneType.driving ) continue;

				coords.push( new TvLaneCoord( incomingRoad, laneSection, lane, laneSOffset as LaneDistance, 0 ) );

			}

		}

		return coords;

	}

	private shouldLinkRoads ( junction: TvJunction ): boolean {

		return junction.getRoadLinks().length == 0;

	}
}
