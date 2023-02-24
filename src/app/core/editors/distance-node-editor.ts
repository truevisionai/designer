/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractShapeEditor } from './abstract-shape-editor';
import { MouseButton, PointerEventData, PointerMoveData } from '../../events/pointer-event-data';
import { KeyboardInput } from '../input';
import { DistanceNode } from 'app/modules/three-js/objects/control-point';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { MouseButton, PointerEventData, PointerMoveData } from '../../events/pointer-event-data';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { KeyboardInput } from '../input';
import { AbstractShapeEditor } from './abstract-shape-editor';

export class DistanceNodeEditor extends AbstractShapeEditor {


    constructor ( private maxControlPoints: number = 1000 ) {

        super();

    }

    draw () {

        this.curveGeometryAdded.emit( null );

    }


    onPointerDown ( e: PointerEventData ) {

        if ( e.button == MouseButton.RIGHT ) return;

        this.pointerIsDown = true;

        this.pointerDownAt = e.point;

        if ( this.controlPoints.length >= this.maxControlPoints ) return;

        if ( e.object != null && e.object.userData.is_selectable === true ) return;

        if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

            e.point.z = 0;

            this.addControlPoint( e.point );

            this.draw();
        }
    }

    onPointerMoved ( e: PointerMoveData ): void {

        const direction = 'sCoordinate';

        if ( e.point != null && this.pointerIsDown && this.controlPoints.length > 0 ) {

            this.isDragging = true;

            if ( this.currentPoint != null ) {

                const roadPos = new TvPosTheta();
                const lanePos = new TvPosTheta();

                const node = ( this.currentPoint as DistanceNode );

                e.point.z = 0;

                const position = e.point;

                // this gets the road and the s and t values
                const road = TvMapQueries.getRoadByCoords( position.x, position.y, roadPos );

                // this get the lane from road, s and t values
                // roadPos is only used to read
                const result = TvMapQueries.getLaneByCoords( position.x, position.y, roadPos );

                if ( road ) {

                    let finalPosition = null;

                    if ( direction == 'sCoordinate' ) {

                        // fixed t and only s-value will change
                        // finalPosition = OpenDriveQueries.getLanePosition( node.roadId, node.laneId, roadPos.s, node.t, lanePos );
                        finalPosition = TvMapQueries.getLanePosition( node.roadId, node.laneId, roadPos.s, 0, lanePos );

                    } else if ( direction == 'tCoordinate' ) {

                        // fixed s and only t-value will change
                        finalPosition = TvMapQueries.getLanePosition( node.roadId, node.laneId, node.s, roadPos.t, lanePos );

                    }

                    node.s = roadPos.s;

                    // node.t = roadPos.t;

                    this.currentPoint.copyPosition( finalPosition );

                    this.controlPointMoved.emit( this.currentPoint );

                }
            }
        }
    }

    /**
     * override addControlPoint function
     * @param position
     * @returns
     */
    addControlPoint ( position: THREE.Vector3 ): DistanceNode {

        const result = TvMapQueries.getLaneCenterPosition( position );

        const finalPosition = result.position;

        const laneCoord = result.laneCoord;

        // create the distance node
        const node = this.createDistanceNode(
            laneCoord.roadId,
            laneCoord.laneId,
            laneCoord.s,
            laneCoord.offset,
            finalPosition
        );

        // redundant
        // node.copyPosition( finalPosition );

        this.controlPoints.push( node );

        this.controlPointAdded.emit( node );

        return node;
    }
}
