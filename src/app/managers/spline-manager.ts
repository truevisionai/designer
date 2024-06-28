/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { Box3 } from "three";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { RoadFactory } from "app/factories/road-factory.service";
import { SplineService } from "../services/spline/spline.service";
import { TvJunction } from "../map/models/junctions/tv-junction";

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
		private splineService: SplineService
	) {
	}

	createSpline ( spline: AbstractSpline ) {

		this.validateSpline( spline );

		this.buildSpline( spline ); 											// first step is always to build the spline from the control points

		this.updateSplineBoundingBox( spline );

		this.splineService.updateWidthCache( spline );

		this.junctionManager.updateJunctions( spline );

	}

	updateSpline ( spline: AbstractSpline ) {

		this.validateSpline( spline );

		this.buildSpline( spline );												// first step is always to build the spline from the control points

		for ( const road of this.splineService.getRoads( spline ) ) {

			this.roadManager.updateRoad( road );

		}

		this.splineService.updateWidthCache( spline );

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );

		this.updateSplineBoundingBox( spline );

		this.junctionManager.updateJunctions( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvJunction ) {

				this.junctionManager.removeJunction( segment );

				this.mapService.map.removeJunction( segment );
			}

		}

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				this.roadManager.removeRoad( segment );

				this.mapService.map.removeRoad( segment );

			}

		}

		// const segments = spline.getSplineSegments();
		//
		// for ( const segment of segments ) {
		//
		// 	if ( segment.isRoad ) {
		//
		// 		const road = segment.getInstance<TvRoad>();
		//
		// 		this.roadManager.removeRoad( road );
		//
		// 		this.mapService.map.removeRoad( road );
		//
		// 	}
		//
		// }

		this.mapService.map.removeSpline( spline );

	}

	syncSuccessorSpline ( spline: AbstractSpline ) {

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		const lastSegment = spline.segmentMap.getLast();

		if ( lastSegment instanceof TvRoad ) {

			this.syncRoadSuccessorSpline( lastSegment );

		} else if ( lastSegment instanceof TvJunction ) {

			// console.error( "method not implemented" );

		}

	}

	syncPredecessorSpline ( spline: AbstractSpline ) {

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		const firstSegment = spline.segmentMap.getFirst();

		if ( firstSegment instanceof TvRoad ) {

			this.syncRoadPredecessorrSpline( firstSegment );

		} else if ( firstSegment instanceof TvJunction ) {

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

		const segments = spline.segmentMap.toArray();

		if ( segments.length == 0 ) {

			this.addDefaultSegment( spline, this.splineService.findFirstRoad( spline ) );

		}

		if ( segments.length >= 1 ) {

			const firstSegment = this.splineService.findFirstRoad( spline );

			if ( firstSegment ) {

				firstSegment.sStart = 0;

			}

		}

		// const roads = this.splineService.getRoads( spline );

		// // remove invalid segment that has no geometries
		// for ( let i = 0; i < roads.length; i++ ) {
		//
		// 	const road = roads[ i ];
		//
		// 	if ( road.geometries.length > 0 ) continue;
		//
		// 	this.roadManager.removeRoad( road );
		//
		// }

	}

	private addDefaultSegment ( spline: AbstractSpline, input?: TvRoad ) {

		const segments = spline.segmentMap.toArray();

		if ( segments.length == 0 && spline.controlPoints.length >= 2 ) {

			let road: TvRoad;

			if ( !input ) {
				road = this.roadFactory.createDefaultRoad();
			}

			road.spline = spline;
			road.successor = null;
			road.predecessor = null;
			spline.segmentMap.set( 0, road );


			this.mapService.map.addRoad( road );
			// this.roadManager.addRoad( road );
		}
	}

	private updateSplineBoundingBox ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		let boundingBox = new Box3();

		const segments = spline.segmentMap.toArray();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( segment instanceof TvRoad ) {

				if ( segment.boundingBox ) {

					boundingBox.union( segment.boundingBox );

				} else {

					segment.computeBoundingBox();

					if ( segment.boundingBox ) {

						boundingBox.union( segment.boundingBox );

					} else {

						boundingBox = null;

					}
				}
			}
		}

		if ( !boundingBox ) {
			boundingBox = this.updateSplineBouningBoxFromGeometry( spline );
		}

		if ( !boundingBox ) {
			console.error( "boundingBox is null", spline );
			return;
		}

		spline.boundingBox = boundingBox;

	}

	private updateSplineBouningBoxFromGeometry ( spline: AbstractSpline ) {

		const boundingBox = new Box3();

		const segments = spline.segmentMap.toArray();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( segment instanceof TvRoad ) {

				const roadLength = segment.length;

				for ( let s = 0; s < roadLength; s++ ) {

					const width = segment.getRoadWidthAt( s );

					const left = segment.getPosThetaAt( s, -width.totalWidth );
					const right = segment.getPosThetaAt( s, width.totalWidth );

					boundingBox.expandByPoint( left.position );
					boundingBox.expandByPoint( right.position );

				}

			}

		}

		return boundingBox;
	}
}


