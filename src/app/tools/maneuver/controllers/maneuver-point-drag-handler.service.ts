/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointDragHandler } from "../../../core/drag-handlers/point-drag-handler.service";
import { SplineControlPoint } from "../../../objects/road/spline-control-point";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";
import { Vector3 } from "three";
import { AbstractSpline } from "../../../core/shapes/abstract-spline";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverPointDragHandler extends PointDragHandler<SplineControlPoint> {

	onDragStart ( object: SplineControlPoint, e: PointerEventData ): void {

		// throw new Error( "Method not implemented." );

	}

	onDrag ( object: SplineControlPoint, e: PointerEventData ): void {

		const newPosition = this.getProjectedPosition( object, e );

		object.setPosition( newPosition );

	}

	onDragEnd ( object: SplineControlPoint, e: PointerEventData ): void {

		const newPosition = this.getProjectedPosition( object, e );

		Commands.UpdatePosition( object, newPosition, this.dragStartPosition );

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