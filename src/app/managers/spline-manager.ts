import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map.service";
import { JunctionManager } from "./junction-manager";
import { RoadManager } from "./road-manager";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { RoadService } from "app/services/road/road.service";
import { IntersectionManager } from "./intersection-manager";
import { Box3 } from "three";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";

@Injectable( {
	providedIn: 'root'
} )
export class SplineManager {

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private junctionManager: JunctionManager,
		private roadSplineService: RoadSplineService,
		private roadService: RoadService,
		private intersectionManager: IntersectionManager,
	) { }

	createSpline ( spline: AbstractSpline ) {

		// first step is always to build the spline from the control points
		this.buildSpline( spline, spline.getFirstRoadSegment() );

		this.updateSplineBoundingBox( spline );

		this.intersectionManager.updateIntersections( spline );

	}

	updateSpline ( spline: AbstractSpline ) {

		// first step is always to build the spline from the control points
		this.buildSpline( spline, spline.getFirstRoadSegment() );

		for ( const road of spline.getRoads() ) {

			this.roadManager.updateRoad( road );

		}

		this.syncSuccessorSpline( spline );

		this.syncPredecessorSpline( spline );

		this.updateSplineBoundingBox( spline );

		this.intersectionManager.updateIntersections( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		const roads = spline.getRoads();

		for ( const road of roads ) {

			this.roadManager.removeRoad( road );

		}

		const junctions = spline.getJunctions();

		for ( const junction of junctions ) {

			this.junctionManager.removeJunction( junction );

		}

		const segments = spline.getSplineSegments();

		for ( const segment of segments ) {

			if ( segment.isRoad ) {

				const road = segment.getInstance<TvRoad>();

				this.roadManager.removeRoad( road );

			} else if ( segment.isJunction ) {

				// throw new Error( "method not implemented" );

			}

		}

		this.mapService.map.removeSpline( spline );

	}

	syncSuccessorSpline ( spline: AbstractSpline ) {

		const lastSegment = spline.getLastSegment();

		if ( lastSegment?.isRoad ) {

			const road = lastSegment.getInstance<TvRoad>();

			this.syncRoadSuccessorSpline( road );

		} else if ( lastSegment?.isJunction ) {

			throw new Error( "method not implemented" );

		}

	}

	syncPredecessorSpline ( spline: AbstractSpline ) {

		const firstSegment = spline.getFirstSegment();

		if ( firstSegment?.isRoad ) {

			const road = firstSegment.getInstance<TvRoad>();

			this.syncRoadPredecessorrSpline( road );

		} else if ( firstSegment?.isJunction ) {

			throw new Error( "method not implemented" );

		}

	}

	syncRoadSuccessorSpline ( updatedRoad: TvRoad ) {

		if ( !updatedRoad.successor ) return;

		if ( !updatedRoad.successor.isRoad ) return;

		const nextRoad = updatedRoad.successor.getElement<TvRoad>();

		if ( updatedRoad.successor.contactPoint == TvContactPoint.START ) {

			const firstControlPoint = nextRoad.spline.controlPoints[ 0 ];
			const secondControlPoint = nextRoad.spline.controlPoints[ 1 ];

			firstControlPoint.position.copy( updatedRoad.getEndPosTheta().position );

			const direction = updatedRoad.getEndPosTheta().toDirectionVector();
			const distance = firstControlPoint.position.distanceTo( secondControlPoint.position );
			const directedPosition = firstControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );


			secondControlPoint.position.copy( directedPosition );

		} else {

			const secondLastControlPoint = nextRoad.spline.controlPoints[ nextRoad.spline.controlPoints.length - 2 ];
			const lastControlPoint = nextRoad.spline.controlPoints[ nextRoad.spline.controlPoints.length - 1 ];

			lastControlPoint.position.copy( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector();
			const distance = secondLastControlPoint.position.distanceTo( lastControlPoint.position );
			const directedPosition = lastControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondLastControlPoint.position.copy( directedPosition );


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

			firstControlPoint.position.copy( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector().negate();
			const distance = firstControlPoint.position.distanceTo( secondControlPoint.position );
			const directedPosition = firstControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondControlPoint.position.copy( directedPosition );

		} else {

			const secondLastControlPoint = prevRoad.spline.controlPoints[ prevRoad.spline.controlPoints.length - 2 ];
			const lastControlPoint = prevRoad.spline.controlPoints[ prevRoad.spline.controlPoints.length - 1 ];

			lastControlPoint.position.copy( updatedRoad.getStartPosTheta().position );

			const direction = updatedRoad.getStartPosTheta().toDirectionVector().negate();
			const distance = secondLastControlPoint.position.distanceTo( lastControlPoint.position );
			const directedPosition = lastControlPoint.position.clone().add( direction.clone().multiplyScalar( distance ) );

			secondLastControlPoint.position.copy( directedPosition );

		}

		this.buildSpline( prevRoad.spline );

	}

	private buildSpline ( spline: AbstractSpline, firstSegment?: SplineSegment ): void {

		this.addDefaulSegment( spline, firstSegment );

		this.roadSplineService.rebuildSpline( spline );

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

				road = this.roadService.createDefaultRoad();

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

					boundingBox.union( road.boundingBox );

				}


			}

		}

		spline.boundingBox = boundingBox;
	}
}


