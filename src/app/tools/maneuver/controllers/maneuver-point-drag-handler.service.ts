/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { SplineControlPoint } from "../../../objects/road/spline-control-point";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";
import { Vector3 } from "app/core/maths"
import { AbstractSpline } from "../../../core/shapes/abstract-spline";
import { BaseDragHandler } from "app/core/drag-handlers/base-drag-handler";
import { RoadTangentPoint } from "app/objects/road/road-tangent-point";
import { RoadTangentPointDragHandler } from "app/tools/road/handlers/road-tangent-point-drag-handler.service";
import { RoadControlPointDragHandler } from "app/tools/road/handlers/road-control-point-drag-handler.service";
import { RoadControlPoint } from "app/objects/road/road-control-point";

function isDraggingSupported ( object: SplineControlPoint | RoadControlPoint ): boolean {

	const index = object.index ?? object.spline.getControlPoints().indexOf( object );

	return index > 0 && index < object.spline.getControlPointCount() - 1;

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverSplineControlPointDragHandler extends BaseDragHandler<SplineControlPoint> {

	isDraggingSupported ( object: SplineControlPoint ): boolean {

		return isDraggingSupported( object );

	}

	onDragStart ( object: SplineControlPoint, e: PointerEventData ): void {

		// this.setDragStartPosition( object.position );

	}

	onDrag ( point: SplineControlPoint, e: PointerEventData ): void {

		point.setPosition( this.getProjectedPosition( point, e.point ) );

	}

	onDragEnd ( point: SplineControlPoint, e: PointerEventData ): void {

		const projectedPosition = this.getProjectedPosition( point, e.point );

		Commands.SetPointPosition( point.spline, point, projectedPosition, this.dragStartPosition );

	}

	protected getProjectedPosition ( point: SplineControlPoint, position: Vector3 ): Vector3 {

		const initialPosition = position.clone();

		const heading = this.getHeading( point );

		const projectedPosition = point.position.clone()
			.add( new Vector3( Math.cos( heading ), Math.sin( heading ), 0 )
				.multiplyScalar( initialPosition.sub( point.position )
					.dot( new Vector3( Math.cos( heading ), Math.sin( heading ), 0 ) ) ) );

		return projectedPosition;

	}

	protected getHeading ( point: SplineControlPoint ): number {

		let heading = point.hdg;

		const spline = point.spline;

		if ( spline instanceof AbstractSpline ) {

			const index = spline.getControlPoints().indexOf( point );

			if ( index == 1 ) {

				const previousPoint = spline.getControlPoints()[ 0 ] as SplineControlPoint;

				heading = previousPoint.hdg || heading;

			}

		}

		return heading;

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverRoadTangentPointDragHandler extends RoadTangentPointDragHandler {

	isDraggingSupported ( point: RoadTangentPoint ): boolean {

		return point.controlPoint.shouldUpdateHeading();

	}

}



@Injectable( {
	providedIn: 'root'
} )
export class ManeuverRoadControlPointDragHandler extends RoadControlPointDragHandler {

	isDraggingSupported ( point: RoadControlPoint ): boolean {

		return isDraggingSupported( point );

	}

}
