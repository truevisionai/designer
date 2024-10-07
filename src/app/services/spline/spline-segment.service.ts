/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapService } from '../map/map.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { SplineUtils } from 'app/utils/spline.utils';
import { Log } from 'app/core/utils/log';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { MapEvents } from 'app/events/map-events';
import { LinkFactory } from 'app/map/models/link-factory';

@Injectable( {
	providedIn: 'root'
} )
export class SplineSegmentService {

	constructor (
		private mapService: MapService,
	) {
	}

	removeSegments ( spline: AbstractSpline ): void {

		this.removeConnections( spline );

		this.removeRoadSegments( spline );

	}

	private removeConnections ( spline: AbstractSpline ): void {

		spline.getJunctionSegments().forEach( junction => {

			this.removeRoadConnectionAndSplines( junction, spline );

		} );

	}

	private removeRoadConnectionAndSplines ( junction: TvJunction, spline: AbstractSpline ): void {

		const connections = this.getConnections( junction, spline );

		for ( const connection of connections ) {

			this.removeRoadAndSpline( connection );

			junction.removeConnection( connection );

		}

		MapEvents.junctionUpdated.emit( junction );

	}

	removeRoadAndSpline ( connection: TvJunctionConnection ): void {

		Log.info( 'Removing connection', connection.toString() );

		this.mapService.removeSpline( connection.connectingRoad.spline );

		this.mapService.removeRoad( connection.connectingRoad );

		MapEvents.removeMesh.emit( connection.connectingRoad.spline );

	}

	private getConnections ( junction: TvJunction, spline: AbstractSpline ): TvJunctionConnection[] {

		const connections = new Set<TvJunctionConnection>();

		for ( const road of spline.getRoadSegments() ) {

			junction.getConnectionsByRoad( road ).forEach( connection => connections.add( connection ) );

		}

		return [ ...connections ];

	}

	private removeRoadSegments ( spline: AbstractSpline ): void {

		spline.getRoadSegments().forEach( road => {

			if ( this.mapService.hasRoad( road ) ) {

				this.mapService.removeRoad( road );

			} else {

				Log.warn( "Road already removed", road.toString() );

			}

		} );

	}

	addSegment ( spline: AbstractSpline, sOffset: number, segment: TvRoad | TvJunction ): void {

		if ( segment instanceof TvRoad ) {

			this.addRoadSegment( spline, sOffset, segment );

		} else if ( segment instanceof TvJunction ) {

			throw new Error( 'Junction segment not supported' );

		} else {

			throw new Error( 'Unknown segment type' );

		}

	}

	removeSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ): void {

		if ( segment instanceof TvRoad ) {

			this.removeRoadSegment( spline, segment );

		} else if ( segment instanceof TvJunction ) {

			this.removeJunctionSegment( spline, segment );

		} else {

			throw new Error( 'Unknown segment type' );

		}

	}

	private addRoadSegment ( spline: AbstractSpline, sOffset: number, newRoad: TvRoad ): void {

		const existingRoad = spline.segmentMap.findAt( sOffset ) as TvRoad;

		existingRoad.successor?.replace( existingRoad, newRoad, TvContactPoint.END );

		newRoad.linkPredecessor( existingRoad, TvContactPoint.END );

		spline.addSegment( sOffset, newRoad );

		this.mapService.addRoad( newRoad );

	}

	private addJunctionSegment ( spline: AbstractSpline, sOffset: number, junction: TvJunction ) {

	}

	private removeRoadSegment ( spline: AbstractSpline, road: TvRoad ): void {

		if ( !SplineUtils.hasSegment( spline, road ) ) {
			throw new Error( 'Segment not found' );
		}

		this.removeRoadLinks( road );

		spline.removeSegment( road );

		this.mapService.removeRoad( road );

	}

	private removeRoadLinks ( road: TvRoad ): void {

		const predecessor = road.predecessor;

		const successor = road.successor;

		if ( successor?.element instanceof TvRoad && predecessor?.element instanceof TvRoad ) {

			predecessor.element.successor = LinkFactory.createRoadLink( successor.element as TvRoad, successor.contact );

			successor.element.predecessor = LinkFactory.createRoadLink( predecessor.element as TvRoad, predecessor.contact );

		} else if ( successor?.element instanceof TvJunction && predecessor?.element instanceof TvRoad ) {

			predecessor.element.successor = LinkFactory.createJunctionLink( successor.element as TvJunction );

			successor.element.replaceIncomingRoad( road, predecessor.element, predecessor.contact );

		}

	}

	private removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ): void {

		spline.removeSegment( junction );

		this.removeRoadConnectionAndSplines( junction, spline );

	}

}
