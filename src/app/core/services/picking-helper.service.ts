/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { Object3D, Vector3 } from 'three';

export class PickingHelper {

    public static checkControlPointInteraction ( event: PointerEventData, tag: string, maxDistance = 0.5 ): BaseControlPoint {

        let hasInteracted = false;

        let currentMin = Number.MAX_VALUE;
        let controlPoint: BaseControlPoint = null;

        for ( let i = 0; i < event.intersections.length; i++ ) {

            const intersection = event.intersections[ i ];

            if ( event.button === MouseButton.LEFT && intersection.object && intersection.object[ 'tag' ] == tag ) {

                hasInteracted = true;

                if ( intersection.distanceToRay < currentMin && intersection.distanceToRay < maxDistance ) {

                    currentMin = intersection.distanceToRay;

                    controlPoint = intersection.object as BaseControlPoint;

                }
            }
        }

        return controlPoint;
    }

    public static findNearest<T extends Object3D> ( position: Vector3, objects: T[], maxDistance = 0.5 ): T {

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

}
