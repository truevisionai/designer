/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ManeueverHelper } from '../spline/spline.factory';
import { SplineType } from 'app/core/shapes/spline-type';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionGeometryService {

	constructor () { }

	updateConnectionGeometry ( connection: TvJunctionConnection ): void {

		if ( connection.connectingRoad.spline.type == SplineType.AUTO || connection.connectingRoad.spline.type == SplineType.AUTOV2 ) {

			this.updateAutoConnectionGeometry( connection );

		} else if ( connection.connectingRoad.spline.type == SplineType.EXPLICIT ) {

			this.updateExplicitConnectionGeometry( connection );

		}

	}

	private updateAutoConnectionGeometry ( connection: TvJunctionConnection ): void {

		const prevCoord = connection.connectingRoad.predecessor.toRoadCoord();

		const nextRoadCoord = connection.connectingRoad.successor.toRoadCoord();

		connection.getLaneLinks().forEach( link => {

			if ( !connection.isCornerConnection ) {
				link.getConnectingLane().clearLaneHeight();
			}

			const entry = prevCoord.toLaneCoord( link.getIncomingLane() );
			const exit = nextRoadCoord.toLaneCoord( link.getOutgoingLane() );

			const newPositions = ManeueverHelper.getPositionsFromLaneCoord( entry, exit );
			const currentPositions = connection.getSpline().getControlPoints();

			for ( let i = 0; i < newPositions.length; i++ ) {
				currentPositions[ i ].position.copy( newPositions[ i ] );
			}

		} );

	}

	private updateExplicitConnectionGeometry ( connection: TvJunctionConnection ): void {

		connection.getLaneLinks().forEach( link => {

			this.updateLinkGeometry( connection, link );

		} );

	}

	private updateLinkGeometry ( connection: TvJunctionConnection, link: TvJunctionLaneLink ): void {

		if ( !connection.isCornerConnection ) {
			link.getConnectingLane().clearRoadMarks();
		}

		const entry = link.getIncomingCoord();
		const exit = link.getOutgoingCoord();

		const newPositions = ManeueverHelper.getPositionsFromLaneCoord( entry, exit );
		const currentPoints = connection.getSpline().getControlPoints();

		// only update the first and last point
		currentPoints[ 0 ].position.copy( newPositions[ 0 ] );

		currentPoints[ currentPoints.length - 1 ].position.copy( newPositions[ newPositions.length - 1 ] );

	}

}
