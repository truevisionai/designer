import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Log } from 'app/core/utils/log';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvContactPoint } from 'app/map/models/tv-common';
import { RoadService } from '../road/road.service';
import { Maths } from 'app/utils/maths';
import { Vector2 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionRoadService {

	constructor ( private roadService: RoadService ) { }

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

				// const distanceFromBox = junction.boundingBox.distanceToPoint( new Vector2( startPosition.x, startPosition.y ) );

				// if ( !Maths.approxEquals( distanceFromBox, 0 ) ) {
				// 	Log.error( 'Invalid Road To Junction Distance', road.toString(), junction.toString() );
				// }

			} else {

				road.successor = new TvRoadLink( TvRoadLinkType.JUNCTION, junction, null );

				// const distanceFromBox = junction.boundingBox.distanceToPoint( new Vector2( endPosition.x, endPosition.y ) );

				// if ( !Maths.approxEquals( distanceFromBox, 0 ) ) {
				// 	Log.error( 'Invalid Road To Junction Distance', road.toString(), junction.toString() );
				// }

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

		junction.connections.forEach( connection => {

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

			this.roadService.remove( connection.connectingRoad );

		}

	}

	private shouldLinkRoads ( junction: TvJunction ): boolean {

		return this.getRoadLinks( junction ).length == 0;

	}
}
