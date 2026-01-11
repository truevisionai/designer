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
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
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

	removeExtraSegments ( spline: AbstractSpline ): void {

		this.removeConnections( spline );

		this.removeRoadSegments( spline, true );

		const firstSegment = spline.getRoadSegments()[ 0 ];

		firstSegment?.removeLinks();

		spline.clearSegments();

		spline.addSegment( 0, firstSegment );

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

			MapEvents.removeMesh.emit( connection.connectingRoad.spline );

			junction.removeConnection( connection );

		}

		junction.removeSpline( spline );

		MapEvents.junctionUpdated.emit( junction );

	}

	private getConnections ( junction: TvJunction, spline: AbstractSpline ): TvJunctionConnection[] {

		const connections = new Set<TvJunctionConnection>();

		for ( const road of spline.getRoadSegments() ) {

			junction.getConnectionsByRoad( road ).forEach( connection => connections.add( connection ) );

		}

		return [ ...connections ];

	}

	private removeRoadSegments ( spline: AbstractSpline, keepFirst: boolean = false ): void {

		spline.getRoadSegments().forEach( ( road, index ) => {

			if ( keepFirst && index === 0 ) {
				road.removeLinks();
				return
			};

			if ( this.mapService.hasRoad( road ) ) {

				this.mapService.removeRoad( road );

			} else {

				Log.warn( "Road already removed", road.toString() );

			}

		} );

		MapEvents.removeMesh.emit( spline );

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

		const existingRoad = spline.getSegmentAt( sOffset ) as TvRoad;

		existingRoad.successor?.replace( existingRoad, newRoad, TvContactPoint.END );

		newRoad.linkPredecessorRoad( existingRoad, TvContactPoint.END );

		spline.addSegment( sOffset, newRoad );

		this.mapService.addRoad( newRoad );

	}

	private addJunctionSegment ( spline: AbstractSpline, sOffset: number, junction: TvJunction ): void {

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

			predecessor.element.setSuccessor( LinkFactory.createRoadLink( successor.element as TvRoad, successor.contact ) );

			successor.element.setPredecessor( LinkFactory.createRoadLink( predecessor.element as TvRoad, predecessor.contact ) );

		} else if ( successor?.element instanceof TvJunction && predecessor?.element instanceof TvRoad ) {

			predecessor.element.setSuccessor( LinkFactory.createJunctionLink( successor.element as TvJunction ) );

			successor.element.replaceIncomingRoad( road, predecessor.element, predecessor.contact );

		}

	}

	private removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ): void {

		spline.removeSegment( junction );

		this.removeRoadConnectionAndSplines( junction, spline );

	}

	/**
	 * Attempts to merge the first pair of adjacent road segments in the spline when they are
	 * geometrically continuous and have matching lane/topology metadata.
	 * Returns true if a merge was performed.
	 */
	mergeAdjacentRoadSegmentsIfCompatible ( spline: AbstractSpline ): boolean {

		for ( const segment of spline.getSegments() ) {

			if ( !( segment instanceof TvRoad ) ) continue;

			const next = spline.getNextSegment( segment );

			if ( !( next instanceof TvRoad ) ) continue;

			if ( !segment.matches( next ) ) continue;

			this.mergeRoadSegments( spline, segment, next );

			return true;
		}

		return false;
	}


	// eslint-disable-next-line max-lines-per-function
	private mergeRoadSegments ( spline: AbstractSpline, roadA: TvRoad, roadB: TvRoad ): void {

		const offset = roadA.length;

		roadB.getPlanView().geometries.forEach( geometry => {
			const clone = geometry.clone();
			clone.s += offset;
			roadA.getPlanView().addGeometry( clone );
		} );

		roadB.getLaneProfile().getLaneOffsets().forEach( laneOffset => {
			const clone = laneOffset.clone( laneOffset.s + offset );
			roadA.getLaneProfile().addLaneOffset( clone );
		} );

		roadB.getLaneProfile().getLaneSections().forEach( section => {
			const clone = section.cloneAtS( section.id, section.s + offset, undefined, roadA );
			roadA.getLaneProfile().addLaneSection( clone );
		} );

		roadA.computeLaneSectionCoordinates();
		roadA.getLaneProfile().updateLaneOffsetValues( roadA.length );

		roadB.getRoadObjects().forEach( obj => {
			const clone = obj.clone();
			clone.s = obj.s + offset;
			roadA.addRoadObject( clone );
		} );

		roadB.getRoadSignals().forEach( signal => {
			roadA.addRoadSignal(
				signal.s + offset,
				signal.t,
				signal.id,
				signal.name,
				signal.dynamic,
				signal.orientation,
				signal.zOffset,
				signal.country,
				signal.type,
				signal.subtype,
				signal.value,
				signal.unit,
				signal.height,
				signal.width,
				signal.text,
				signal.hOffset,
				signal.pitch,
				signal.roll
			);
		} );

		if ( roadB.successor ) {
			roadA.setSuccessor( roadB.successor.clone() );
		} else {
			roadA.removeSuccessor();
		}

		if ( roadA.successor?.isRoad ) {
			const successorRoad = roadA.successor.element as TvRoad;
			successorRoad.setPredecessor( LinkFactory.createRoadLink( roadA, roadA.successor.contactPoint ) );
		}

		spline.removeSegment( roadB );

		if ( this.mapService.hasRoad( roadB ) ) {
			this.mapService.removeRoad( roadB );
		} else {
			Log.warn( "Road already removed", roadB.toString() );
		}

		MapEvents.removeMesh.emit( roadB );

		SplineUtils.updateInternalLinks( spline );

		spline.updateSegmentGeometryAndBounds();
	}
}
