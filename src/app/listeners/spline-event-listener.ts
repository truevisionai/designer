import { SceneService } from "app/services/scene.service";
import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { RoadService } from "app/services/road/road.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { Box3, Vector3 } from "three";
import { IntersectionService } from "app/services/junction/intersection.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { RoadCreatedEvent } from "../events/road/road-created-event";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { SplineCreatedEvent } from "../events/spline/spline-created-event";
import { SplineUpdatedEvent } from "../events/spline/spline-updated-event";
import { SplineRemovedEvent } from "../events/spline/spline-removed-event";
import { JunctionRemovedEvent } from "../events/junction/junction-removed-event";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { JunctionUpdatedEvent } from "app/events/junction/junction-updated-event";


@Injectable( {
	providedIn: 'root'
} )
export class SplineEventListener {

	private debug: boolean = false;

	constructor (
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private intersectionService: IntersectionService
	) {
	}

	init () {

		MapEvents.splineCreated.subscribe( e => this.onSplineCreated( e ) );
		MapEvents.splineRemoved.subscribe( e => this.onSplineRemoved( e ) );
		MapEvents.splineUpdated.subscribe( e => this.onSplineUpdated( e ) );

	}

	onSplineCreated ( event: SplineCreatedEvent ) {

		if ( this.debug ) console.debug( 'onSplineCreated', event );

		event.spline.controlPoints.forEach( point => {

			SceneService.addToolObject( point );

		} )

		this.buildSpline( event.spline );

		if ( event.spline.controlPoints.length < 2 ) return;

		this.updateSegments( event.spline );

		this.updateSplineBoundingBox( event.spline );

		this.checkIntersections( event.spline );

	}

	onSplineRemoved ( event: SplineRemovedEvent ) {

		if ( this.debug ) console.debug( 'onSplineRemoved', event );

		event.spline.controlPoints.forEach( point => SceneService.removeFromTool( point ) );

		this.removeRoads( event.spline );

		this.removeJunctions( event.spline );

		this.removeSegments( event.spline );

		// const junctions = event.spline.getJunctions();

		// this.removeJunctionsFromSpline( junctions );

	}

	onSplineUpdated ( event: SplineUpdatedEvent ) {

		if ( this.debug ) console.debug( 'onSplineUpdated', event );

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = event.spline.getJunctions();

		const intersections = this.intersectionService.getSplineIntersections( event.spline );

		if ( junctions.length == 0 ) {

			// we're looking at possibly creating new junctions
			const firstSegment = event.spline.getFirstRoadSegment();

			this.buildSpline( event.spline, firstSegment );

			if ( event.spline.controlPoints.length < 2 ) return;

			this.updateSegments( event.spline );

			this.updateSplineBoundingBox( event.spline );

			this.checkIntersections( event.spline );

		} else {

			if ( intersections.length == 0 ) {

				this.removeJunctionsFromSpline( junctions );

			} else {

				// update junctions
				if ( junctions.length == intersections.length ) {

					this.removeJunctionsFromSpline( junctions );

					this.checkIntersections( event.spline );

				} else {

				}

			}

		}

		// const firstSegment = event.spline.getFirstRoadSegment();

		// this.removeRoads( event.spline );

		// this.removeJunctions( event.spline );

		// this.removeSegments( event.spline );

		// this.buildSpline( event.spline, firstSegment );

		// if ( event.spline.controlPoints.length < 2 ) return;

		// this.updateSegments( event.spline );

		// this.updateSplineBoundingBox( event.spline );

		// this.checkIntersections( event.spline );

	}

	updateSplineJunction ( spline: AbstractSpline, junctions: TvJunction[], intersections: any[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			const junction = junctions[ i ];

			const splines = junction.getIncomingSplines();

			for ( let i = 0; i < splines.length; i++ ) {

				const spline = splines[ i ];

				const junctionSegment = spline.findSegment( junction );

				if ( !junctionSegment ) continue;

				const intersection: Vector3 = intersections.find( intersection => intersection.spline == spline );

				if ( !intersection ) continue;

				const coord = spline.getCoordAt( intersection );

				const nextSegment = spline.getNextSegment( junction );

				if ( nextSegment && nextSegment.isRoad ) {

					nextSegment.setStart( coord.s + 12 );

				}

				junctionSegment.setStart( coord.s - 12 );

				this.roadSplineService.rebuildSplineRoads( spline );

				MapEvents.junctionUpdated.emit( new JunctionUpdatedEvent( junction ) );

			}

		}

	}

	removeJunctionsFromSpline ( junctions: TvJunction[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			const junction = junctions[ i ];

			const splines = junction.getIncomingSplines();

			for ( let i = 0; i < splines.length; i++ ) {

				const spline = splines[ i ];

				const nextSegment = spline.getNextSegment( junction );

				if ( nextSegment && nextSegment.isRoad ) {

					this.roadService.removeRoad( nextSegment.getInstance<TvRoad>() );

				}

				spline.removeSegment( junction );

				this.roadSplineService.rebuildSplineRoads( spline );

			}

			MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction ) );

		}
	}

	private removeRoads ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( const segment of segments.filter( segment => segment.isRoad ) ) {

			const road = segment.getInstance<TvRoad>();

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

		}

	}

	private removeJunctions ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( const segment of segments.filter( segment => segment.isJunction ) ) {

			const junction: TvJunction = segment.getInstance<TvJunction>();

			const incomingRoads = junction.getIncomingRoads();

			if ( incomingRoads.length == 0 ) continue;

			const hasSameSpline = incomingRoads.every( ( road, index, roads ) => road.spline == roads[ 0 ].spline );

			if ( !hasSameSpline ) continue;

			const otherSpline = incomingRoads[ 0 ].spline;

			// const previousSegment = otherSpline.getFirstRoadSegment();
			const previousSegment = otherSpline.getPreviousSegment( junction );
			const nextSegment = otherSpline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad ) {
				const nextRoad: TvRoad = nextSegment.getInstance<TvRoad>();
				MapEvents.roadRemoved.emit( new RoadRemovedEvent( nextRoad ) );
			}

			otherSpline.removeSegment( junction );

			MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( junction, otherSpline ) );

			this.onSplineUpdated( new SplineUpdatedEvent( otherSpline ) );

		}

	}

	private buildSpline ( spline: AbstractSpline, firstSegment?: SplineSegment ): void {

		this.addDefaulSegment( spline, firstSegment );

		this.roadSplineService.rebuildSplineRoads( spline );

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

	private updateSegments ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( segment.isRoad ) {

				const road = segment.getInstance<TvRoad>();

				MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

			}

		}

	}

	private removeSegments ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			spline.removeSegment( segment.getInstance() );

		}

		spline.getSplineSegments().splice( 0, spline.getSplineSegments().length );

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

	private checkIntersections ( spline: AbstractSpline ) {

		this.intersectionService.checkSplineIntersections( spline );

	}
}
