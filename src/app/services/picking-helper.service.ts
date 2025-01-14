/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { Object3D, Raycaster, Vector3 } from "three";
import { AbstractControlPoint } from "../objects/abstract-control-point";


/**
 * @deprecated dont use this
 */
export class PickingHelper {

	private static raycaster = new Raycaster();

	public static checkControlPointInteraction ( event: PointerEventData, tag: string, maxDistance: number = 0.5 ): AbstractControlPoint {

		let hasInteracted = false;

		let currentMin = Number.MAX_VALUE;
		let controlPoint: AbstractControlPoint = null;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			if ( event.button === MouseButton.LEFT && intersection.object && intersection.object[ 'tag' ] == tag ) {

				hasInteracted = true;

				if ( intersection.distanceToRay < currentMin && intersection.distanceToRay < maxDistance ) {

					currentMin = intersection.distanceToRay;

					controlPoint = intersection.object as AbstractControlPoint;

				}
			}
		}

		return controlPoint;
	}

	public static findNearestViaDistance<T extends Object3D> ( position: Vector3, objects: T[], maxDistance: number = 0.5 ): T {

		let nearestDistance = Number.MAX_VALUE;
		let nearestObject: T = null;

		for ( let i = 0; i < objects.length; i++ ) {

			const object = objects[ i ];

			const distance = position.distanceTo( object.position );

			if ( distance < nearestDistance && distance < maxDistance ) {

				nearestDistance = distance;

				nearestObject = object;

			}
		}

		return nearestObject;
	}

	public static findNearestViaRaycasting<T extends Object3D> ( e: PointerEventData, objects: T[], recursive: boolean = true ): T {

		// Find intersections with the control points
		const results = this.findViaRaycasting( e, objects, recursive );

		// If there are intersections, return the nearest control point
		if ( results.length > 0 ) {
			return results[ 0 ] as T;
		}

		// If there are no intersections, return null
		return null;
	}

	public static findViaRaycasting<T extends Object3D> ( e: PointerEventData, objects: T[], recursive: boolean = true ): T[] {

		// Update the raycaster with the camera and the normalized mouse coordinates
		this.raycaster.setFromCamera( e.mouse, e.camera );

		// 0.001 is a good value for scale factor
		const scaleFactor = 0.001; // Adjust this value to change the sensitivity

		// Calculate the precision based on the approxCameraDistance
		const precision = Math.exp( scaleFactor * e.approxCameraDistance );

		this.raycaster.params.Points.threshold = precision;

		// Find intersections with the control points
		const intersects = this.raycaster.intersectObjects( objects, recursive );

		// If there are intersections, return the nearest control point
		if ( intersects.length > 0 ) {
			return intersects.map( i => i.object as T );
		}

		// If there are no intersections, return null
		return [];
	}

}
