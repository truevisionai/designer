/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "app/core/object-handlers/base-controller";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { SplineService } from "app/services/spline/spline.service";
import { ManeuverControlPointInspector } from "../maneuver.inspector";
import { Vector3 } from "three";
import { PointerEventData } from "app/events/pointer-event-data";
import { Commands } from "app/commands/commands";


@Injectable( {
	providedIn: 'root'
} )
export class ManeuverPointController extends BaseController<SplineControlPoint> {

	constructor (
		private splineService: SplineService,
		private junctionDebugger: JunctionDebugService,
	) {
		super();
	}

	isDraggingSupported (): boolean {
		return true
	}

	showInspector ( object: SplineControlPoint ): void {

		this.setInspector( new ManeuverControlPointInspector( object ) );

	}

	onAdded ( object: SplineControlPoint ): void {

		Log.info( 'Control point added' );

	}

	onUpdated ( object: SplineControlPoint ): void {

		const connectingRoad = this.findConnectingRoad( object.spline );

		if ( !connectingRoad ) {
			Log.error( 'Connecting road not found' );
			return;
		}

		this.splineService.update( object.spline );

		this.markAsDirty( connectingRoad.junction, connectingRoad );

		const mesh = this.junctionDebugger.findMesh( connectingRoad.junction, connectingRoad );

		if ( !mesh ) {
			Log.error( 'ManeuverMesh not found' );
			return;
		}

		this.junctionDebugger.updateManeuver( mesh );
	}

	onRemoved ( object: SplineControlPoint ): void {

		Log.info( 'Control point removed' );

	}

	onDrag ( object: SplineControlPoint, e: PointerEventData ): void {

		const newPosition = this.getProjectedPosition( object, e );

		object.setPosition( newPosition );

	}

	onDragEnd ( object: SplineControlPoint, e: PointerEventData ): void {

		const newPosition = this.getProjectedPosition( object, e );

		Commands.UpdatePosition( object, newPosition, this.dragStartPosition );

	}

	private findConnectingRoad ( spline: AbstractSpline ): TvRoad {

		const road = this.splineService.findFirstRoad( spline );

		if ( !road.isJunction ) return;

		return road;
	}

	private markAsDirty ( junction: TvJunction, connectingRoad: TvRoad ): void {

		const connection = junction.getConnections().find( c => c.connectingRoad === connectingRoad );

		if ( connection ) {

			connection.laneLink.forEach( laneLink => {

				laneLink.dirty = true;

			} );

		}

	}

	private getProjectedPosition ( point: SplineControlPoint, e: PointerEventData ): Vector3 {

		const pointerPointer = e.point.clone();

		let targetHdg = point.hdg;

		const spline = point.spline;

		if ( spline instanceof AbstractSpline ) {

			const index = spline.controlPoints.indexOf( point );

			if ( index == 1 ) {

				const previousPoint = spline.controlPoints[ 0 ] as SplineControlPoint;

				targetHdg = previousPoint.hdg || targetHdg;

			}

		}

		// const direction = new Vector3( Math.cos( targetHdg ), Math.sin( targetHdg ) );

		// the new adjusted position should be the mouse position projected on the heading of the point
		// const projectedPosition = point.position.clone().add( direction )
		// .multiplyScalar( pointerPointer.sub( point.position ).dot( direction ) );

		const projectedPosition = point.position.clone().add( new Vector3( Math.cos( targetHdg ), Math.sin( targetHdg ), 0 ).multiplyScalar( pointerPointer.sub( point.position ).dot( new Vector3( Math.cos( targetHdg ), Math.sin( targetHdg ), 0 ) ) ) );

		return projectedPosition;

	}

}
