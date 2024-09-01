/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { ConnectionManager } from "app/map/junction/connection.manager";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { RoadUtils } from "app/utils/road.utils";
import { SplineUtils } from "app/utils/spline.utils";
import { JunctionManager } from "./junction-manager";
import { MapService } from "app/services/map/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class SplineLinkService {

	constructor (
		private junctionManager: JunctionManager,
		private connectionManager: ConnectionManager,
		private splineBuilder: SplineBuilder,
		private mapService: MapService,
	) { }

	getSuccessorSpline ( spline: AbstractSpline ): AbstractSpline | undefined {

		return SplineUtils.getSuccessorSpline( spline );

	}

	getPredecessorSpline ( spline: AbstractSpline ): AbstractSpline | undefined {

		return SplineUtils.getPredecessorSpline( spline );

	}

	getLinkedSplines ( spline: AbstractSpline ): AbstractSpline[] {

		const linkedSplines = new Set<AbstractSpline>();

		const next = this.getSuccessorSpline( spline );

		const previous = this.getPredecessorSpline( spline );

		if ( next ) linkedSplines.add( next );

		if ( previous ) linkedSplines.add( previous );

		return [ ...linkedSplines ];

	}

	onSplineAdded ( spline: AbstractSpline ) {

		const lastSegment = spline.segmentMap.getLast();
		const successor = SplineUtils.findSuccessor( spline );

		if ( successor instanceof TvJunction && lastSegment instanceof TvRoad ) {
			this.junctionManager.addLink( successor as TvJunction, lastSegment, TvContactPoint.END );
		}

		const firstSegment = spline.segmentMap.getFirst();
		const predecessor = SplineUtils.findPredecessor( spline );

		if ( predecessor instanceof TvJunction && firstSegment instanceof TvRoad ) {
			this.junctionManager.addLink( predecessor as TvJunction, firstSegment, TvContactPoint.START );
		}

	}

	updateLinkedSplines ( spline: AbstractSpline ): void {

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );


	}

	onSplineRemoved ( spline: AbstractSpline ) {

		const lastSegment = spline.segmentMap.getLast();
		const successor = SplineUtils.findSuccessor( spline );

		if ( successor instanceof TvJunction && lastSegment instanceof TvRoad ) {
			this.connectionManager.removeConnections( successor, lastSegment );
			this.junctionManager.updateJunction( successor );
		}

		const firstSegment = spline.segmentMap.getFirst();
		const predecessor = SplineUtils.findPredecessor( spline );

		if ( predecessor instanceof TvJunction && firstSegment instanceof TvRoad ) {
			this.connectionManager.removeConnections( predecessor, firstSegment );
			this.junctionManager.updateJunction( predecessor );
		}

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvJunction ) {

				if ( this.mapService.hasJunction( segment ) ) {

					this.junctionManager.removeJunction( segment, spline, true );

				} else {

					Log.warn( "Junction already removed", segment.toString() );

				}

			}

		}

		this.unlinkSpline( spline );

	}

	unlinkSpline ( spline: AbstractSpline ) {

		const firstSegment = spline.segmentMap.getFirst();
		const lastSegment = spline.segmentMap.getLast();

		if ( firstSegment instanceof TvRoad ) {
			RoadUtils.unlinkPredecessor( firstSegment, false );
		}

		if ( lastSegment instanceof TvRoad ) {
			RoadUtils.unlinkSuccessor( lastSegment, false );
		}

	}

	public fixExternalLinks ( spline: AbstractSpline ) {

		const firstSegment = spline.segmentMap.getFirst();
		const lastSegment = spline.segmentMap.getLast();

		if ( firstSegment instanceof TvRoad ) {
			if ( firstSegment.predecessor?.element instanceof TvRoad ) {
				RoadUtils.linkPredecessor( firstSegment, firstSegment.predecessor.element, firstSegment.predecessor.contactPoint );
			}
		}

		if ( lastSegment instanceof TvRoad ) {
			if ( lastSegment.successor?.element instanceof TvRoad ) {
				RoadUtils.linkSuccessor( lastSegment, lastSegment.successor.element, lastSegment.successor.contactPoint );
			}
		}

	}

	syncSuccessorSpline ( spline: AbstractSpline ) {

		if ( SplineUtils.isConnection( spline ) ) return;

		if ( spline.type === SplineType.EXPLICIT ) return;

		const lastSegment = spline.segmentMap.getLast();

		const splineSuccessor = SplineUtils.findSuccessor( spline );

		// TODO: check this flow

		// if ( lastSegment instanceof TvRoad ) {

		// 	this.syncRoadSuccessorSpline( lastSegment );

		// } else if ( lastSegment instanceof TvJunction ) {

		// 	Log.debug( "last segment is junction", lastSegment.toString(), spline.uuid );

		// }

		if ( splineSuccessor instanceof TvRoad ) {

			Log.debug( "successor is road", splineSuccessor.toString(), spline.uuid );

			const lastRoad = spline.segmentMap.getLast() instanceof TvRoad ? spline.segmentMap.getLast() as TvRoad : null;

			if ( lastRoad ) this.syncRoadSuccessorSpline( lastRoad );

		} else if ( splineSuccessor instanceof TvJunction ) {

			Log.debug( "successor is junction", splineSuccessor.toString(), spline.uuid );

			this.junctionManager.updateConnections( splineSuccessor );

		}

	}

	syncPredecessorSpline ( spline: AbstractSpline ) {

		if ( SplineUtils.isConnection( spline ) ) return;

		if ( spline.type === SplineType.EXPLICIT ) return;

		// TODO: check this flow


		// const firstSegment = spline.segmentMap.getFirst();

		// if ( firstSegment instanceof TvRoad ) {

		// 	this.syncRoadPredecessorrSpline( firstSegment );

		// } else if ( firstSegment instanceof TvJunction ) {

		// 	Log.debug( "first segment is junction", firstSegment.toString(), spline.uuid );

		// }

		const splinePredecessor = SplineUtils.findPredecessor( spline );

		if ( splinePredecessor instanceof TvRoad ) {

			Log.debug( "predecessor is road", splinePredecessor.toString(), spline.uuid );

			const firstRoad = spline.segmentMap.getFirst() instanceof TvRoad ? spline.segmentMap.getFirst() as TvRoad : null;

			if ( firstRoad ) this.syncRoadPredecessorrSpline( firstRoad );

		} else if ( splinePredecessor instanceof TvJunction ) {

			Log.debug( "predecessor is junction", splinePredecessor.toString(), spline.uuid );

			this.junctionManager.updateConnections( splinePredecessor );

		}
	}

	syncRoadSuccessorSpline ( updatedRoad: TvRoad ) {

		if ( !updatedRoad.successor ) return;

		if ( !updatedRoad.successor.isRoad ) return;

		const nextRoad = updatedRoad.successor.getElement<TvRoad>();

		if ( updatedRoad.successor.contactPoint == TvContactPoint.START ) {

			const firstControlPoint = nextRoad.spline.controlPoints[ 0 ];
			const secondControlPoint = nextRoad.spline.controlPoints[ 1 ];

			firstControlPoint.setPosition( updatedRoad.getEndPosTheta().position );

			const direction = updatedRoad.getEndPosTheta().toDirectionVector();
			const distance = firstControlPoint.position.distanceTo( secondControlPoint.position );
			const directedPosition = firstControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondControlPoint.setPosition( directedPosition );

		} else {

			const secondLastControlPoint = nextRoad.spline.controlPoints[ nextRoad.spline.controlPoints.length - 2 ];
			const lastControlPoint = nextRoad.spline.controlPoints[ nextRoad.spline.controlPoints.length - 1 ];

			lastControlPoint.setPosition( updatedRoad.getEndPosTheta().position );

			const direction = updatedRoad.getEndPosTheta().toDirectionVector();
			const distance = secondLastControlPoint.position.distanceTo( lastControlPoint.position );
			const directedPosition = lastControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondLastControlPoint.setPosition( directedPosition );

		}

		this.splineBuilder.buildSpline( nextRoad.spline );

	}

	syncRoadPredecessorrSpline ( updatedRoad: TvRoad ) {

		if ( !updatedRoad.predecessor ) return;

		if ( !updatedRoad.predecessor.isRoad ) return;

		const prevRoad = updatedRoad.predecessor.getElement<TvRoad>();

		if ( updatedRoad.predecessor.contactPoint == TvContactPoint.START ) {

			const firstControlPoint = prevRoad.spline.controlPoints[ 0 ];
			const secondControlPoint = prevRoad.spline.controlPoints[ 1 ];

			firstControlPoint.setPosition( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector().negate();
			const distance = firstControlPoint.position.distanceTo( secondControlPoint.position );
			const directedPosition = firstControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondControlPoint.setPosition( directedPosition );

		} else {

			const secondLastControlPoint = prevRoad.spline.controlPoints[ prevRoad.spline.controlPoints.length - 2 ];
			const lastControlPoint = prevRoad.spline.controlPoints[ prevRoad.spline.controlPoints.length - 1 ];

			lastControlPoint.setPosition( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector().negate();
			const distance = secondLastControlPoint.position.distanceTo( lastControlPoint.position );
			const directedPosition = lastControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondLastControlPoint.setPosition( directedPosition );

		}

		this.splineBuilder.buildSpline( prevRoad.spline );

	}
}
