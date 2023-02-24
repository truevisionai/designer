/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Mesh, Object3D } from 'three';
import { PointerEventData } from '../../events/pointer-event-data';
import { OdLaneDirectionBuilder } from '../../modules/tv-map/builders/od-lane-direction-builder';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { BaseTool } from './base-tool';

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

        let lane = ( object.userData.lane as TvLane );

        this.laneDirectionHelper.setRoad( this.map.getRoadById( lane.roadId ) );

        this.laneDirectionHelper.create();

        // AppInspector.setInspector( LaneTypeInspectorComponent, data );
    }

}
