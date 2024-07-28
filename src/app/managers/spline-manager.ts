/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { SplineService } from "../services/spline/spline.service";
import { TvJunction } from "../map/models/junctions/tv-junction";
import { SplineUtils } from "app/utils/spline.utils";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { Log } from "app/core/utils/log";
import { RoadUtils } from "app/utils/road.utils";

@Injectable( {
	providedIn: 'root'
} )
export class SplineManager {

	private debug = true;

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private junctionManager: JunctionManager,
		private splineService: SplineService,
		private splineValidator: SplineFixerService
	) {
	}

	addSpline ( spline: AbstractSpline ) {

		if ( this.debug ) Log.debug( "addSpline", spline.toString() );

		this.splineValidator.fix( spline );

		this.addSegments( spline );

		this.linkSpline( spline );

		this.splineBuilder.buildGeometry( spline );

		this.splineBuilder.buildSegments( spline );

		this.splineBuilder.buildBoundingBox( spline );

		this.junctionManager.updateJunctions( spline );

	}

	addSegments ( spline: AbstractSpline ) {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				if ( this.mapService.map.roads.has( segment.id ) ) {

					Log.warn( "Road already exists", segment.toString() );

				} else {

					this.mapService.map.addRoad( segment );
				}

			}

		}

	}

	updateSpline ( spline: AbstractSpline ) {

		if ( this.debug ) Log.debug( "updateSpline", spline.toString() );

		this.splineValidator.fix( spline );

		this.splineBuilder.buildGeometry( spline );

		for ( const road of this.splineService.getRoads( spline ) ) {

			this.roadManager.updateRoad( road );

		}

		this.splineBuilder.buildBoundingBox( spline );

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );

		this.junctionManager.updateJunctions( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		if ( this.debug ) Log.debug( "removeSpline", spline.toString() );

		if ( SplineUtils.isConnection( spline ) ) return;

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvJunction ) {

				this.junctionManager.removeJunction( segment, spline, true );

			}

		}

		this.unlinkSpline( spline );

		this.removeMesh( spline );

		this.mapService.map.removeSpline( spline );

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

	linkSpline ( spline: AbstractSpline ) {

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

	removeMesh ( spline: AbstractSpline ) {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				this.roadManager.removeMesh( segment );

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

		// 	console.debug( "last segment is junction", lastSegment.toString(), spline.uuid );

		// }

		if ( splineSuccessor instanceof TvRoad ) {

			console.debug( "successor is road", splineSuccessor.toString(), spline.uuid );

			const lastRoad = spline.segmentMap.getLast() instanceof TvRoad ? spline.segmentMap.getLast() as TvRoad : null;

			if ( lastRoad ) this.syncRoadSuccessorSpline( lastRoad );

		} else if ( splineSuccessor instanceof TvJunction ) {

			console.debug( "successor is junction", splineSuccessor.toString(), spline.uuid );

			this.junctionManager.updateCustomJunctionConnections( splineSuccessor );

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

		// 	console.debug( "first segment is junction", firstSegment.toString(), spline.uuid );

		// }

		const splinePredecessor = SplineUtils.findPredecessor( spline );

		if ( splinePredecessor instanceof TvRoad ) {

			console.debug( "predecessor is road", splinePredecessor.toString(), spline.uuid );

			const firstRoad = spline.segmentMap.getFirst() instanceof TvRoad ? spline.segmentMap.getFirst() as TvRoad : null;

			if ( firstRoad ) this.syncRoadSuccessorSpline( firstRoad );

		} else if ( splinePredecessor instanceof TvJunction ) {

			console.debug( "predecessor is junction", splinePredecessor.toString(), spline.uuid );

			this.junctionManager.updateCustomJunctionConnections( splinePredecessor );

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

			lastControlPoint.setPosition( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector();
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


