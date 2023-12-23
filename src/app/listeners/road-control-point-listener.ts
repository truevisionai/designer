import { MapEvents, RoadControlPointCreatedEvent, RoadControlPointRemovedEvent, RoadControlPointUpdatedEvent, RoadUpdatedEvent } from "../events/map-events";
import { RoadService } from "app/services/road/road.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { RoadLinkService } from "app/services/road/road-link.service";
import { AbstractControlPoint } from "app/modules/three-js/objects/abstract-control-point";
import { MapService } from "app/services/map.service";
import { Box3 } from "three";
import { SplineControlPoint } from "app/modules/three-js/objects/spline-control-point";
import { IntersectionService } from "app/services/junction/intersection.service";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class RoadControlPointListener {

	private debug = true;

	constructor (
		private roadService: RoadService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
		private intersectionService: IntersectionService,
	) {

	}

	init () {

		MapEvents.roadControlPointCreated.subscribe( e => this.onRoadControlPointCreated( e ) );
		MapEvents.roadControlPointRemoved.subscribe( e => this.onRoadControlPointRemoved( e ) );
		MapEvents.roadControlPointUpdated.subscribe( e => this.onRoadControlPointUpdated( e ) );

		MapEvents.controlPointSelected.subscribe( e => this.onControlPointSelected( e ) );
		MapEvents.controlPointUnselected.subscribe( e => this.onControlPointUnselected( e ) );

	}

	onControlPointUnselected ( e: AbstractControlPoint ): void {

		// ToolManager.getTool<any>()?.onControlPointUnselected( e );

	}

	onControlPointSelected ( e: AbstractControlPoint ): void {

		// ToolManager.getTool<any>()?.onControlPointSelected( e );

	}

	onRoadControlPointCreated ( event: RoadControlPointCreatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadControlPointCreated', event );

		if ( event.controlPoint.spline.controlPoints.length < 2 ) return;

		this.updateRoads( event.controlPoint.spline, event.controlPoint );

		this.updateSplineBoundingBox( event.controlPoint.spline );

		this.checkIntersections( event.controlPoint, event.controlPoint.spline );

	}

	onRoadControlPointUpdated ( event: RoadControlPointUpdatedEvent ) {

		if ( this.debug ) console.debug( 'onRoadControlPointUpdated', event );

		if ( event.controlPoint.spline.controlPoints.length < 2 ) return;

		this.updateRoads( event.spline, event.controlPoint );

		this.updateSplineBoundingBox( event.spline );

	}

	onRoadControlPointRemoved ( event: RoadControlPointRemovedEvent ) {

		if ( this.debug ) console.debug( 'onRoadControlPointRemoved', event );

		if ( event.spline.controlPoints.length < 2 ) return;

		this.updateRoads( event.spline, event.controlPoint );

		this.updateSplineBoundingBox( event.spline );

	}

	private updateRoads ( spline: AbstractSpline, point: AbstractControlPoint ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = this.roadService.getRoad( segment.id );

			if ( !road ) continue;

			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

			this.roadService.updateRoadNodes( road );

			this.roadLinkService.updateLinks( road, point );

		}

	}

	private updateSplineBoundingBox ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		const boundingBox = new Box3();

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = this.roadService.getRoad( segment.id );

			if ( !road ) continue;

			if ( road.boundingBox ) {

				boundingBox.union( road.boundingBox );

			} else {

				road.computeBoundingBox();

				boundingBox.union( road.boundingBox );

			}

		}

		spline.boundingBox = boundingBox;
	}

	private checkIntersections ( controlPoint: SplineControlPoint, spline: AbstractSpline ) {

		this.intersectionService.checkSplineIntersections( spline );

	}


}
