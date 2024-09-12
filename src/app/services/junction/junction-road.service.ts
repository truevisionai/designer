/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Log } from 'app/core/utils/log';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvContactPoint, TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { RoadService } from '../road/road.service';
import { MapService } from '../map/map.service';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TrafficRule } from 'app/map/models/traffic-rule';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionRoadService {

	constructor (
		private roadService: RoadService,
		private mapService: MapService
	) { }

	getRoadLinks ( junction: TvJunction ): TvRoadLink[] {

		const links: TvRoadLink[] = [];

		const roads = this.getIncomingRoads( junction );

		for ( const road of roads ) {

			if ( road.geometries.length == 0 ) {
				Log.warn( 'Road with no geometries linked to junction', road.toString(), junction.toString() );
			}

			if ( road.successor?.element == junction ) {

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.END ) );

			} else if ( road.predecessor?.element == junction ) {

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.START ) );

			}

		}

		return links;

	}

	linkRoads ( junction: TvJunction ): void {

		if ( !this.shouldLinkRoads( junction ) ) return;

		const roads = this.getIncomingRoads( junction );

		for ( const road of roads ) {

			const startPosition = road.getStartPosTheta().toVector3();
			const endPosition = road.getEndPosTheta().toVector3();

			const startDistance = startPosition.distanceTo( junction.centroid );
			const endDistance = endPosition.distanceTo( junction.centroid );

			// start is closer to junction than end, so its likely a predecessor
			if ( startDistance < endDistance ) {

				road.predecessor = new TvRoadLink( TvRoadLinkType.JUNCTION, junction, null );

			} else {

				road.successor = new TvRoadLink( TvRoadLinkType.JUNCTION, junction, null );

			}


		}

	}

	removeLinks ( junction: TvJunction ): void {

		const incomingRoads = this.getIncomingRoads( junction );

		incomingRoads.forEach( road => {

			this.removeLink( junction, road );

		} );

	}

	removeLink ( junction: TvJunction, road: TvRoad ): void {

		if ( road.successor?.element === junction ) {

			road.successor = null;

		} else if ( road.predecessor?.element === junction ) {

			road.predecessor = null;

		} else {

			Log.warn( 'Road is not connected to junction', road.toString(), junction.toString() );

		}

	}

	getIncomingRoads ( junction: TvJunction ): TvRoad[] {

		const roads = new Set<TvRoad>();

		junction.getConnections().forEach( connection => {

			if ( connection.connectingRoad?.predecessor?.isRoad ) {

				roads.add( connection.connectingRoad.predecessor.element as TvRoad );

			}

			if ( connection.connectingRoad?.successor?.isRoad ) {

				roads.add( connection.connectingRoad.successor.element as TvRoad );

			}

		} );

		return Array.from( roads );

	}

	getIncomingSplines ( junction: TvJunction ): AbstractSpline[] {

		const splines = new Set<AbstractSpline>();

		this.getIncomingRoads( junction ).forEach( road => splines.add( road.spline ) );

		return Array.from( splines );

	}

	getConnectingRoads ( junction: TvJunction ): TvRoad[] {

		const roads: TvRoad[] = [];

		junction.getConnections().forEach( connection => {

			roads.push( connection.connectingRoad );

		} );

		return roads;
	}

	removeByIncomingRoad ( junction: TvJunction, road: TvRoad ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			if ( connection.incomingRoad === road ) {

				this.roadService.remove( connection.connectingRoad );

			} else if ( connection.connectingRoad.successor?.element == road ) {

				this.roadService.remove( connection.connectingRoad );

			} else if ( connection.connectingRoad.predecessor?.element == road ) {

				this.roadService.remove( connection.connectingRoad );

			}

		}

	}

	removeAll ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			if ( this.mapService.hasRoad( connection.connectingRoad ) ) {

				this.roadService.remove( connection.connectingRoad );

			} else {

				Log.warn( 'Road already removed', connection.connectingRoad.toString() );

			}

		}

	}

	getJunctionGates ( junction: TvJunction ): TvLaneCoord[] {

		const coords: TvLaneCoord[] = [];

		const incomingRoads = this.getIncomingRoads( junction );

		for ( const incomingRoad of incomingRoads ) {

			const contactPoint = incomingRoad.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

			const s = contactPoint == TvContactPoint.START ? 0 : incomingRoad.length;

			const laneSection = incomingRoad.getLaneProfile().getLaneSectionAt( s );

			let side = incomingRoad.trafficRule == TrafficRule.LHT ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

			// if road contact is start then reverse the side
			if ( contactPoint == TvContactPoint.START ) {

				side = side == TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;

			}

			const lanes = side == TvLaneSide.LEFT ? laneSection.getLeftLanes() : laneSection.getRightLanes();

			for ( const lane of lanes ) {

				if ( lane.type != TvLaneType.driving ) continue;

				coords.push( new TvLaneCoord( incomingRoad, laneSection, lane, s, 0 ) );

			}

		}

		return coords;

	}

	private shouldLinkRoads ( junction: TvJunction ): boolean {

		return this.getRoadLinks( junction ).length == 0;

	}
}
