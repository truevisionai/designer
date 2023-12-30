import {
	MapEvents,
	ControlPointCreatedEvent,
	ControlPointRemovedEvent,
	ControlPointUpdatedEvent,
	RoadUpdatedEvent, SplineUpdatedEvent
} from "../events/map-events";
import { Injectable } from "@angular/core";
import { SceneService } from "../services/scene.service";

@Injectable( {
	providedIn: 'root'
} )
export class SplinePointListener {

	private debug = true;

	constructor (
	) {

	}

	init () {

		MapEvents.controlPointCreated.subscribe( e => this.onRoadControlPointCreated( e ) );
		MapEvents.controlPointRemoved.subscribe( e => this.onRoadControlPointRemoved( e ) );
		MapEvents.controlPointUpdated.subscribe( e => this.onRoadControlPointUpdated( e ) );

	}

	onRoadControlPointCreated ( event: ControlPointCreatedEvent ) {

		SceneService.addToolObject( event.controlPoint );

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

		//if ( event.controlPoint.spline.controlPoints.length < 2 ) return;

		//this.updateRoads( event.controlPoint.spline, event.controlPoint );

		//this.updateSplineBoundingBox( event.controlPoint.spline );

		//this.checkIntersections( event.controlPoint, event.controlPoint.spline );

	}

	onRoadControlPointUpdated ( event: ControlPointUpdatedEvent ) {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

		//if ( this.debug ) console.debug( 'onRoadControlPointUpdated', event );
		//
		//if ( event.controlPoint.spline.controlPoints.length < 2 ) return;
		//
		//this.updateRoads( event.spline, event.controlPoint );
		//
		//this.updateSplineBoundingBox( event.spline );

	}

	onRoadControlPointRemoved ( event: ControlPointRemovedEvent ) {

		SceneService.removeFromTool( event.controlPoint );

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

		//if ( this.debug ) console.debug( 'onRoadControlPointRemoved', event );
		//
		//if ( event.spline.controlPoints.length < 2 ) return;
		//
		//this.updateRoads( event.spline, event.controlPoint );
		//
		//this.updateSplineBoundingBox( event.spline );

	}

	// private updateRoads ( spline: AbstractSpline, point: AbstractControlPoint ) {

	// 	const segments = spline.getSplineSegments();

	// 	for ( let i = 0; i < segments.length; i++ ) {

	// 		const segment = segments[ i ];

	// 		if ( !segment.isRoad ) continue;

	// 		const road = this.roadService.getRoad( segment.id );

	// 		if ( !road ) continue;

	// 		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	// 		this.roadService.updateRoadNodes( road );

	// 		this.roadLinkService.updateLinks( road, point );

	// 	}

	// }

	// private updateSplineBoundingBox ( spline: AbstractSpline ) {

	// 	if ( spline.controlPoints.length < 2 ) return;

	// 	const boundingBox = new Box3();

	// 	const segments = spline.getSplineSegments();

	// 	for ( let i = 0; i < segments.length; i++ ) {

	// 		const segment = segments[ i ];

	// 		if ( !segment.isRoad ) continue;

	// 		const road = this.roadService.getRoad( segment.id );

	// 		if ( !road ) continue;

	// 		if ( road.boundingBox ) {

	// 			boundingBox.union( road.boundingBox );

	// 		} else {

	// 			road.computeBoundingBox();

	// 			boundingBox.union( road.boundingBox );

	// 		}

	// 	}

	// 	spline.boundingBox = boundingBox;
	// }

	// private checkIntersections ( controlPoint: SplineControlPoint, spline: AbstractSpline ) {

	// 	this.intersectionService.checkSplineIntersections( spline );

	// }

}
