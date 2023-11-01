/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { Object3D, Raycaster, Vector3 } from 'three';
import { AbstractControlPoint } from "../modules/three-js/objects/abstract-control-point";

export class PickingHelper {

	private static raycaster = new Raycaster();

	public static checkControlPointInteraction ( event: PointerEventData, tag: string, maxDistance = 0.5 ): AbstractControlPoint {

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

	public static findNearestViaDistance<T extends Object3D> ( position: Vector3, objects: T[], maxDistance = 0.5 ): T {

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

	public static findNearestViaRaycasting<T extends Object3D> ( e: PointerEventData, objects: T[], recursive = true ): T {

		// Find intersections with the control points
		const results = this.findViaRaycasting( e, objects, recursive );

		// If there are intersections, return the nearest control point
		if ( results.length > 0 ) {
			return results[ 0 ] as T;
		}

		// If there are no intersections, return null
		return null;
	}

	public static findViaRaycasting<T extends Object3D> ( e: PointerEventData, objects: T[], recursive = true ): T[] {

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

	public static findAllByTag<T extends Object3D> ( tag: string, e: PointerEventData, objects: T[], recursive = true ): T[] {

		const intersections = this.findViaRaycasting( e, objects, recursive );

		return intersections.filter( i => i[ 'tag' ] === tag );
	}

	public static findByTag<T extends Object3D> ( tag: string, e: PointerEventData, objects: T[], recursive = true ): T {

		const results = this.findAllByTag( tag, e, objects, recursive );

		return results.length ? results[ 0 ] : null;
	}

	public static findAllByObjectType<T extends Object3D> ( type, e: PointerEventData, objects: T[], recursive = true ): T[] {

		const results = this.findViaRaycasting( e, objects, recursive );

		return results.filter( i => i.type === type );
	}

	public static findByObjectType<T extends Object3D> ( type: any, e: PointerEventData, objects: T[], recursive = true ): T {

		const results = this.findAllByObjectType<T>( type, e, objects, recursive );

		return results.length ? results[ 0 ] : null;

	}

	public static checkLaneObjectInteraction ( event: PointerEventData, tag?: string ): TvLane {

		const laneTag = tag || ObjectTypes.LANE;

		let lane = null;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			if ( intersection.object && intersection.object[ 'tag' ] === laneTag ) {

				if ( intersection.object.userData.lane ) {

					lane = intersection.object.userData.lane as TvLane;

					break;
				}
			}
		}

		return lane;
	}

	public static checkReferenceLineInteraction ( event: PointerEventData, tag: string ): TvLane {

		let line = null;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			if ( intersection.object && intersection.object[ 'tag' ] === tag ) {

				if ( intersection.object.userData.lane ) {

					line = intersection.object.userData.lane as TvLane;

					break;
				}
			}
		}

		return line;
	}

}
