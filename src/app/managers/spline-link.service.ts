/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { ConnectionManager } from "app/map/junction/connection.manager";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";
import { RoadUtils } from "app/utils/road.utils";
import { JunctionManager } from "./junction-manager";
import { MapService } from "app/services/map/map.service";
import { Vector3 } from "three";
import { AbstractControlPoint } from "app/objects/abstract-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class SplineLinkService {

	constructor (
		private junctionManager: JunctionManager,
		private connectionManager: ConnectionManager,
		private geometryGenerator: SplineGeometryGenerator,
		private mapService: MapService,
	) { }

	onSplineAdded ( spline: AbstractSpline ): void {

		const lastSegment = spline.segmentMap.getLast();
		const successor = spline.getSuccessor();

		if ( successor instanceof TvJunction && lastSegment instanceof TvRoad ) {
			this.junctionManager.addLink( successor as TvJunction, lastSegment, TvContactPoint.END );
		}

		const firstSegment = spline.segmentMap.getFirst();
		const predecessor = spline.getPredecessor();

		if ( predecessor instanceof TvJunction && firstSegment instanceof TvRoad ) {
			this.junctionManager.addLink( predecessor as TvJunction, firstSegment, TvContactPoint.START );
		}

	}

	updateLinkedSplines ( spline: AbstractSpline ): void {

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );

	}

	onSplineRemoved ( spline: AbstractSpline ): void {

		this.removeLinksWithJunctions( spline );

		this.removeJunctionSegments( spline );

		this.unlinkSpline( spline );

	}

	private removeLinksWithJunctions ( spline: AbstractSpline ): void {

		if ( spline.isLastSegmentRoad() && spline.getSuccessor() instanceof TvJunction ) {

			const junction = spline.getSuccessor() as TvJunction;
			const road = spline.getLastSegment() as TvRoad;

			this.connectionManager.removeConnections( junction, road );
			this.junctionManager.updateJunction( junction );

		}

		if ( spline.isFirstSegmentRoad() && spline.getPredecessor() instanceof TvJunction ) {

			const junction = spline.getPredecessor() as TvJunction;
			const road = spline.getFirstSegment() as TvRoad;

			this.connectionManager.removeConnections( junction, road );
			this.junctionManager.updateJunction( junction );

		}

	}

	private removeJunctionSegments ( spline: AbstractSpline ): void {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvJunction ) {

				if ( this.mapService.hasJunction( segment ) ) {

					this.junctionManager.removeJunction( segment, spline, true );

				} else {

					Log.warn( "Junction already removed", segment.toString() );

				}

			}

		}

	}

	private unlinkSpline ( spline: AbstractSpline ): void {

		const firstSegment = spline.segmentMap.getFirst();
		const lastSegment = spline.segmentMap.getLast();

		if ( firstSegment instanceof TvRoad ) {
			RoadUtils.unlinkPredecessor( firstSegment, false );
		}

		if ( lastSegment instanceof TvRoad ) {
			RoadUtils.unlinkSuccessor( lastSegment, false );
		}

	}

	private syncSuccessorSpline ( spline: AbstractSpline ): void {

		if ( spline.isConnectingRoad() ) return;

		const successor = spline.getSuccessor();

		if ( spline.hasSuccessor() && spline.successorIsRoad() ) {

			this.syncRoadSuccessorSpline( spline.getLastSegment() as TvRoad );

		} else if ( successor instanceof TvJunction ) {

			this.junctionManager.updateConnections( successor );

		}

	}

	private syncPredecessorSpline ( spline: AbstractSpline ): void {

		if ( spline.isConnectingRoad() ) return;

		const predecessor = spline.getPredecessor();

		if ( predecessor instanceof TvRoad ) {

			const firstRoad = spline.segmentMap.getFirst() instanceof TvRoad ? spline.segmentMap.getFirst() as TvRoad : null;

			if ( firstRoad ) this.syncRoadPredecessorrSpline( firstRoad );

		} else if ( predecessor instanceof TvJunction ) {

			this.junctionManager.updateConnections( predecessor );

		}

	}

	private syncRoadSuccessorSpline ( updatedRoad: TvRoad ): void {

		if ( !updatedRoad.successor ) return;

		if ( !updatedRoad.successor.isRoad ) return;

		const nextRoad = updatedRoad.successor.getElement<TvRoad>();

		const isStartContact = updatedRoad.successor!.contactPoint === TvContactPoint.START;

		const controlPoints = this.getControlPointsToAdjust( nextRoad.spline, isStartContact );

		if ( !controlPoints ) return;

		const [ targetPoint, adjacentPoint ] = controlPoints;

		const target = updatedRoad.getEndPosTheta();

		const targetDirection = target.toDirectionVector();

		this.adjustControlPoints( target.position, targetDirection, targetPoint, adjacentPoint );

		this.geometryGenerator.buildSpline( nextRoad.spline );

	}

	private syncRoadPredecessorrSpline ( updatedRoad: TvRoad ): void {

		if ( !updatedRoad.predecessor ) return;

		if ( !updatedRoad.predecessor.isRoad ) return;

		const prevRoad = updatedRoad.predecessor.getElement<TvRoad>();

		const isStartContact = updatedRoad.predecessor!.contactPoint === TvContactPoint.START;

		const controlPoints = this.getControlPointsToAdjust( prevRoad.spline, isStartContact );

		if ( !controlPoints ) return;

		const [ targetPoint, adjacentPoint ] = controlPoints;

		const target = updatedRoad.getStartPosTheta();

		const targetDirection = target.toDirectionVector().negate();

		this.adjustControlPoints( target.position, targetDirection, targetPoint, adjacentPoint );

		this.geometryGenerator.buildSpline( prevRoad.spline );

	}

	private getControlPointsToAdjust ( spline: AbstractSpline, isStartContact: boolean ): [ AbstractControlPoint, AbstractControlPoint ] | null {

		const controlPoints = spline.getControlPoints();

		if ( isStartContact ) {

			return [ controlPoints[ 0 ], controlPoints[ 1 ] ];

		} else {

			const lastIndex = controlPoints.length - 1;

			return [ controlPoints[ lastIndex ], controlPoints[ lastIndex - 1 ] ];

		}

	}

	private adjustControlPoints ( position: Vector3, direction: Vector3, targetPoint: AbstractControlPoint, adjacentPoint: AbstractControlPoint ): void {

		const distance = targetPoint.position.distanceTo( adjacentPoint.position );

		targetPoint.setPosition( position );

		const directedPosition = targetPoint.position.clone().add( direction.multiplyScalar( distance ) );

		adjacentPoint.setPosition( directedPosition );

	}

}
