/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadGeometryService } from '../road/road-geometry.service';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ManeueverHelper } from '../spline/spline.factory';
import { SplineType } from 'app/core/shapes/abstract-spline';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionGeometryService {

	constructor (
		private roadGeometryService: RoadGeometryService,
	) { }

	updateConnectionGeometry ( connection: TvJunctionConnection ): void {

		if ( connection.connectingRoad.spline.type == SplineType.AUTO || connection.connectingRoad.spline.type == SplineType.AUTOV2 ) {

			this.updateAutoConnectionGeometry( connection );

		} else if ( connection.connectingRoad.spline.type == SplineType.EXPLICIT ) {

			this.updateExplicitConnectionGeometry( connection );

		}

	}

	private updateAutoConnectionGeometry ( connection: TvJunctionConnection ): void {

		const prevCoord = this.roadGeometryService.findLinkCoord( connection.connectingRoad.predecessor );

		const nextRoad = connection.connectingRoad.successor.element as TvRoad;

		const nextRoadCoord = this.roadGeometryService.findLinkCoord( connection.connectingRoad.successor );

		connection.laneLink.forEach( link => {

			if ( !connection.isCornerConnection ) {
				link.connectingLane.roadMarks.clear();
			}

			const incomingLane = link.incomingLane;
			const connectingLane = link.connectingLane;
			const outgoingLane = nextRoad.laneSections[ 0 ].getLaneById( connectingLane.successorId );

			const entry = prevCoord.toLaneCoord( incomingLane );
			const exit = nextRoadCoord.toLaneCoord( outgoingLane );

			const newPositions = ManeueverHelper.getPositionsFromLaneCoord( entry, exit );
			const currentPositions = connection.getSpline().getControlPoints();

			for ( let i = 0; i < newPositions.length; i++ ) {
				currentPositions[ i ].position.copy( newPositions[ i ] );
			}

		} );

	}

	private updateExplicitConnectionGeometry ( connection: TvJunctionConnection ): void {

		connection.laneLink.forEach( link => {

			this.updateLinkGeometry( connection, link );

		} );

	}

	private updateLinkGeometry ( connection: TvJunctionConnection, link: TvJunctionLaneLink ): void {

		if ( !connection.isCornerConnection ) {
			link.connectingLane.roadMarks.clear();
		}

		const prevCoord = this.getPredecessorCoord( connection.connectingRoad );
		const nextRoadCoord = this.getSuccessorCoord( connection.connectingRoad );

		const incomingLane = link.incomingLane;
		const connectingLane = link.connectingLane;

		const outgoingLane = nextRoadCoord.road.laneSections[ 0 ].getLaneById( connectingLane.successorId );

		const entry = prevCoord.toLaneCoord( incomingLane );
		const exit = nextRoadCoord.toLaneCoord( outgoingLane );

		const newPositions = ManeueverHelper.getPositionsFromLaneCoord( entry, exit );
		const currentPoints = connection.getRoad().spline.getControlPoints();

		// only update the first and last point
		currentPoints[ 0 ].position.copy( newPositions[ 0 ] );

		currentPoints[ currentPoints.length - 1 ].position.copy( newPositions[ newPositions.length - 1 ] );

	}

	private getPredecessorCoord ( road: TvRoad ): TvRoadCoord {

		return this.roadGeometryService.findLinkCoord( road.predecessor );

	}

	private getSuccessorCoord ( road: TvRoad ): TvRoadCoord {

		return this.roadGeometryService.findLinkCoord( road.successor );

	}

}
