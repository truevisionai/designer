import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map.service";
import { JunctionManager } from "./junction-manager";
import { RoadManager } from "./road-manager";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { MapEvents } from "app/events/map-events";
import { RoadCreatedEvent } from "app/events/road/road-created-event";
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

		this.syncSuccessorSpline( spline );

		// this.updatePredecessor( spline );

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

		this.mapService.map.removeSpline( spline );

	}

	updatePredecessor ( spline: AbstractSpline ) {

		const firstSegment = spline.getFirstSegment();

		if ( firstSegment.isRoad ) {

			throw new Error( "method not implemented" );

		} else {

			throw new Error( "method not implemented" );

		}

	}

	syncSuccessorSpline ( spline: AbstractSpline ) {

		const lastSegment = spline.getLastSegment();

		if ( lastSegment?.isRoad ) {

			const road = lastSegment.getInstance<TvRoad>();

			if ( !road.successor ) return;

			if ( road.successor.isRoad ) {

				const successor = road.successor.getElement<TvRoad>();

				if ( road.successor.contactPoint == TvContactPoint.START ) {

					const firstControlPoint = successor.spline.controlPoints[ 0 ];

					firstControlPoint.position.copy( road.getEndPosTheta().position );

				} else {

					const lastControlPoint = successor.spline.controlPoints[ successor.spline.controlPoints.length - 1 ];

					lastControlPoint.position.copy( road.getEndPosTheta().position );

				}

				this.buildSpline( successor.spline );

			} else {

				throw new Error( "method not implemented" );

			}

		} else if ( lastSegment?.isJunction ) {

			throw new Error( "method not implemented" );

		}

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

			MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );
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


