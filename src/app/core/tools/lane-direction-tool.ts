/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { PointerEventData } from '../../events/pointer-event-data';
import { Mesh, Object3D } from 'three';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { OdLaneDirectionBuilder } from '../../modules/tv-map/builders/od-lane-direction-builder';

export class LaneDirectionTool extends BaseTool {

    name: string = 'LaneDirection';

    private laneDirectionHelper: OdLaneDirectionBuilder;

    constructor () {

        super();

    }

    init () {

        super.init();

        this.laneDirectionHelper = new OdLaneDirectionBuilder( null );
    }


    disable (): void {

        super.disable();

        this.laneDirectionHelper.clear();
    }

    onPointerDown ( e: PointerEventData ) {

        super.onPointerDown( e );

        let laneFound = false;

        this.checkLaneIntersection( e.intersections, ( object: Object3D ) => {

            laneFound = true;

            this.selectLane( object as Mesh );

        } );

        if ( !laneFound ) {

            this.laneDirectionHelper.clear();
            this.clearInspector();
        }
    }

    private selectLane ( object: Mesh ) {

        let lane = (object.userData.lane as TvLane);

        this.laneDirectionHelper.setRoad( this.openDrive.getRoadById( lane.roadId ) );

        this.laneDirectionHelper.create();

        // AppInspector.setInspector( LaneTypeInspectorComponent, data );
    }

}
