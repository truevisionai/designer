/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { Box3 } from "three";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { RoadFactory } from "app/factories/road-factory.service";
import { SplineSegmentService } from "app/services/spline/spline-segment.service";

@Injectable( {
	providedIn: 'root'
} )
export class SplineManager {

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private junctionManager: JunctionManager,
		private roadFactory: RoadFactory,
		private segmentService: SplineSegmentService,
	) {
	}

	createSpline ( spline: AbstractSpline ) {

		this.validateSpline( spline );

		this.buildSpline( spline ); 											// first step is always to build the spline from the control points

		this.updateSplineBoundingBox( spline );

		this.segmentService.updateWidthCache( spline );

		this.junctionManager.updateJunctions( spline );

	}

	updateSpline ( spline: AbstractSpline ) {

		this.validateSpline( spline );

		this.buildSpline( spline );												// first step is always to build the spline from the control points

		for ( const road of spline.getRoads() ) {

			this.roadManager.updateRoad( road );

		}

		this.segmentService.updateWidthCache( spline );

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );

		this.updateSplineBoundingBox( spline );

		this.junctionManager.updateJunctions( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		if ( spline.isConnectingRoad() ) return;

		const junctions = spline.getJunctions();

		for ( const junction of junctions ) {

			this.junctionManager.removeJunction( junction );

			this.mapService.map.removeJunction( junction );

		}

		const roads = spline.getRoads();

		for ( const road of roads ) {

			this.roadManager.removeRoad( road );

			this.mapService.map.removeRoad( road );

		}

		const segments = spline.getSplineSegments();

		for ( const segment of segments ) {

			if ( segment.isRoad ) {

				const road = segment.getInstance<TvRoad>();

				this.roadManager.removeRoad( road );

				this.mapService.map.removeRoad( road );

			}

		}

		this.mapService.map.removeSpline( spline );

	}

	syncSuccessorSpline ( spline: AbstractSpline ) {

		if ( spline.isConnectingRoad() ) return;

		const lastSegment = spline.getLastSegment();

		if ( lastSegment?.isRoad ) {

			const road = lastSegment.getInstance<TvRoad>();

			this.syncRoadSuccessorSpline( road );

		} else if ( lastSegment?.isJunction ) {

			// console.error( "method not implemented" );

		}

	}

	syncPredecessorSpline ( spline: AbstractSpline ) {

		if ( spline.isConnectingRoad() ) return;

		const firstSegment = spline.getFirstSegment();

		if ( firstSegment?.isRoad ) {

			const road = firstSegment.getInstance<TvRoad>();

			this.syncRoadPredecessorrSpline( road );

		} else if ( firstSegment?.isJunction ) {

			// console.error( "method not implemented" );

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

		this.buildSpline( nextRoad.spline );

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

		this.buildSpline( prevRoad.spline );

	}

	private buildSpline ( spline: AbstractSpline ): void {

		this.splineBuilder.buildSpline( spline );

	}

	private validateSpline ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		const segments = spline.getSplineSegments();

		if ( segments.length == 0 ) {

			this.addDefaulSegment( spline, spline.getFirstSegment() );

		}

		if ( segments.length >= 1 ) {

			const firstSegment = segments[ 0 ];

			firstSegment.setStart( 0 );

		}

		// remove invalid segment that has no geometries
		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			if ( segment.geometries.length > 0 ) continue;

			const road = segment.getInstance<TvRoad>();

			this.roadManager.removeRoad( road );

		}

	}

	private addDefaulSegment ( spline: AbstractSpline, firstSegment?: SplineSegment ) {

		const segments = spline.getSplineSegments();

		if ( segments.length == 0 && spline.controlPoints.length >= 2 ) {

			let road: TvRoad

			if ( firstSegment && firstSegment.isRoad ) {

				road = firstSegment.getInstance<TvRoad>();

				road.successor = null;
				road.predecessor = null;

			} else {

				road = this.roadFactory.createDefaultRoad();

				this.mapService.map.addRoad( road );

			}

			road.spline = spline;

			spline.addRoadSegment( 0, road );

			this.roadManager.addRoad( road );
		}
	}

	private updateSplineBoundingBox ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		const boundingBox = new Box3();

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( segment.isRoad ) {

				const road = segment.getInstance<TvRoad>();

				if ( road.boundingBox ) {

					boundingBox.union( road.boundingBox );

				} else {

					road.computeBoundingBox();

					if ( road.boundingBox ) {

						boundingBox.union( road.boundingBox );

					} else {

						console.error( "road.boundingBox is null", road );

					}

				}

			}

		}

		if ( boundingBox ) {

			spline.boundingBox = boundingBox;

		} else {

			console.error( "boundingBox is null", spline );

		}

	}
}


